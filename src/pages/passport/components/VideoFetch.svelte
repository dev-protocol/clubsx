<script>
  // Not using types in file as mp4box doesn't export type modules
  import { onMount } from 'svelte'
  import MP4Box from 'mp4box'

  export let url
  export let posterUrl
  export let videoClass

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
      videoElement.value?.play().catch((e) => console.error('Play error:', e))
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
      videoElement.play().catch((e) => console.error('Play error:', e))
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
</script>

<video
  bind:this={videoElement}
  controlsList="nodownload"
  loop
  autoplay
  muted
  poster={posterUrl}
  class={videoClass}
>
  <track kind="captions" />
</video>
