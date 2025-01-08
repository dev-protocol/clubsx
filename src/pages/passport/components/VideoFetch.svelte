<script>
  // Not using types in file as mp4box doesn't export type modules
  import { onMount } from 'svelte'
  import MP4Box from 'mp4box'

  export let url
  export let posterUrl
  export let videoClass
  export let isControlled = false

  let isPaused = true
  let videoElement
  let mediaSource
  let sourceBuffers = {}
  let mp4boxfile
  let pendingSegments = {}

  // Configure chunk size (1MB). Adjust if needed for performance or latency.
  const CHUNK_SIZE = 1_000_000
  let nextRangeStart = 0
  let totalFileSize = 0
  let isDownloading = false

  onMount(() => {
    if (!url) return

    isPaused = true
    mediaSource = new MediaSource()
    videoElement.src = URL.createObjectURL(mediaSource)
    mediaSource.addEventListener('sourceopen', onSourceOpen)

    setupMp4Box()
    startDownload()
  })

  function onSourceOpen() {
    // MediaSource is ready to accept SourceBuffers
    // console.log('MediaSource opened') // Uncomment for debugging
  }

  function setupMp4Box() {
    mp4boxfile = MP4Box.createFile()

    // Fired when MP4Box starts parsing the "moov" box (movie metadata)
    mp4boxfile.onMoovStart = function () {
      // console.log('Parsing movie information...')
    }

    // Fired when MP4Box has the "moov" box and all track info ready
    mp4boxfile.onReady = function (info) {
      // Instead of manually setting mediaSource.duration, rely on segment-based approach
      initializeTracksAndBuffers(info)
      const initSegs = mp4boxfile.initializeSegmentation()

      // Create and append initial SourceBuffers based on track information
      initSegs.forEach((seg) => {
        const trackInfo = info.tracks.find((t) => t.id === seg.id)
        const codec = seg.codec || trackInfo?.codec
        if (!codec) {
          console.error(`Codec undefined for track ID: ${seg.id}`)
          return
        }

        const mime = `video/mp4; codecs="${codec}"`
        if (MediaSource.isTypeSupported(mime)) {
          const sb = mediaSource.addSourceBuffer(mime)
          sourceBuffers[seg.id] = sb

          // Handle subsequent segment appending after one finishes
          sb.addEventListener('updateend', () => onUpdateEnd(seg.id))

          // Append the initialization segment
          sb.appendBuffer(seg.buffer)
          // console.log(`SourceBuffer added with mime: ${mime}`)
        } else {
          console.error(`Unsupported MIME type: ${mime}`)
        }
      })

      // Start MP4Box file processing
      mp4boxfile.start()

      if (!isControlled) {
        // If controlled, then it will play when clicked.
        togglePlay()
      }
    }

    // Fired when a media segment is ready
    mp4boxfile.onSegment = function (
      trackId,
      user,
      buffer,
      sampleNum,
      is_last,
    ) {
      // If the corresponding SourceBuffer is ready, append immediately
      // Otherwise, queue it up in pendingSegments
      if (sourceBuffers[trackId] && !sourceBuffers[trackId].updating) {
        sourceBuffers[trackId].appendBuffer(buffer)
      } else {
        pendingSegments[trackId]?.push(buffer)
      }
    }
  }

  function initializeTracksAndBuffers(info) {
    info.tracks.forEach((track) => {
      // Define segmentation options: smaller durations lead to more frequent, smaller segments.
      mp4boxfile.setSegmentOptions(track.id, { duration: 2 })
      pendingSegments[track.id] = [] // Initialize each track's queue
    })
  }

  function onUpdateEnd(trackId) {
    // After finishing appending to a SourceBuffer,
    // check if there are pending segments and append the next one if available.
    if (
      pendingSegments[trackId]?.length > 0 &&
      !sourceBuffers[trackId].updating
    ) {
      const nextBuffer = pendingSegments[trackId].shift()
      sourceBuffers[trackId].appendBuffer(nextBuffer)
    }

    // Check if the entire stream can now be ended.
    maybeEndOfStream()
  }

  async function startDownload() {
    isDownloading = true
    try {
      totalFileSize = await fetchFileSize()
      downloadChunk()
    } catch (err) {
      console.error('Could not fetch file size:', err)
    }
  }

  function fetchFileSize() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('HEAD', url, true)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const length = parseInt(
            xhr.getResponseHeader('Content-Length') || '0',
            10,
          )
          resolve(length)
        } else {
          reject(new Error(`HEAD request failed with status ${xhr.status}`))
        }
      }
      xhr.onerror = () => reject(new Error('Network error during HEAD request'))
      xhr.send()
    })
  }

  function downloadChunk() {
    if (!isDownloading) return

    // If we've downloaded the entire file, flush MP4Box and possibly end the stream
    if (nextRangeStart >= totalFileSize) {
      mp4boxfile.flush()
      maybeEndOfStream()
      // Start playback after all data is processed
      if (!isControlled) {
        togglePlay()
      }
      return
    }

    const end = Math.min(nextRangeStart + CHUNK_SIZE - 1, totalFileSize - 1)
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'arraybuffer'
    xhr.setRequestHeader('Range', `bytes=${nextRangeStart}-${end}`)

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const buffer = xhr.response
        // MP4Box requires `fileStart` to know where this chunk fits in the file
        buffer.fileStart = nextRangeStart
        nextRangeStart = end + 1

        const next = mp4boxfile.appendBuffer(buffer)
        if (next) {
          // Giving some delay before requesting the next chunk can help throttle bandwidth
          setTimeout(downloadChunk, 100)
        }
      } else {
        console.error('Error downloading chunk. Status:', xhr.status)
      }
    }

    xhr.onerror = function (e) {
      console.error('XHR error during chunk download:', e)
    }
    xhr.send()
  }

  function maybeEndOfStream() {
    // Check if all data is downloaded
    if (nextRangeStart >= totalFileSize) {
      // Verify no pending segments and no buffers updating
      const noPending = Object.values(pendingSegments).every(
        (arr) => arr.length === 0,
      )
      const noUpdating = Object.values(sourceBuffers).every(
        (sb) => !sb.updating,
      )

      if (noPending && noUpdating && mediaSource.readyState === 'open') {
        // All segments have been appended successfully
        mediaSource.endOfStream()
      }
    }
  }

  function togglePlay() {
    if (!videoElement) {
      return
    }

    if (videoElement?.paused) {
      videoElement
        ?.play()
        .then(() => {
          isPaused = false
        })
        .catch((e) => console.error('Play error:', e))
    } else {
      videoElement?.pause()
      isPaused = true
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative m-0 h-full w-full cursor-pointer p-0">
  <video
    bind:this={videoElement}
    controlsList="nodownload"
    autoplay={!isControlled}
    muted
    loop
    poster={posterUrl}
    class={videoClass}
  >
    <track kind="captions" />
  </video>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  {#if isControlled}
    <button
      type="button"
      class="absolute inset-0 m-auto flex size-1/2 items-center justify-center text-white opacity-60"
      on:click|preventDefault={togglePlay}
    >
      {#if isPaused}
        <svg
          class="h-full w-full"
          viewBox="0 0 49 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M44.5 27.134C45.1667 27.5189 45.1667 28.4811 44.5 28.866L5.5 51.3827C4.83333 51.7676 4 51.2865 4 50.5167L4 5.48334C4 4.71354 4.83333 4.23241 5.5 4.61731L44.5 27.134Z"
            fill="white"
          />
          <path
            d="M6.5 53.1147L45.5 30.5981C47.5 29.4434 47.5 26.5566 45.5 25.4019L6.5 2.88526C4.5 1.73056 2 3.17393 2 5.48334L2 50.5167C2 52.8261 4.49999 54.2694 6.5 53.1147Z"
            stroke="black"
            stroke-opacity="0.1"
            stroke-width="4"
          />
        </svg>
      {:else}
        <svg
          class="h-full w-full"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="17" y="15" width="6" height="25" rx="1" fill="white" />
          <rect
            x="15"
            y="13"
            width="10"
            height="29"
            rx="3"
            stroke="black"
            stroke-opacity="0.1"
            stroke-width="4"
          />
          <rect x="33" y="15" width="6" height="25" rx="1" fill="white" />
          <rect
            x="31"
            y="13"
            width="10"
            height="29"
            rx="3"
            stroke="black"
            stroke-opacity="0.1"
            stroke-width="4"
          />
        </svg>
      {/if}
    </button>
  {/if}
</div>
