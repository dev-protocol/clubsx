<script lang="ts">
  import { onMount } from 'svelte'
  let MIME_CODEC: string
  let TOTAL_SEGMENTS: number
  let CURRENT_SEGMENT: number
  let BYTES_FETCHED: number
  let REQUESTED_SEGMENTS: string
  let segmentDuration = 0

  onMount(async () => {
    if (!window.MediaSource) {
      console.error('MediaSource API is not supported in this browser.')
      alert('MediaSource API is not supported in this browser.')
      return
    }

    const video = document.getElementById('videoElement') as HTMLVideoElement
    const assetURL =
      'https://e54a8car3bcq7q8h.public.blob.vercel-storage.com/frag_bunny-ZJaX6ShbMi5ciqThXkW4zyuynptZcT.mp4'
    // Need to be specific for Blink regarding codecs
    // ./mp4info frag_bunny.mp4 | grep Codec
    MIME_CODEC = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    TOTAL_SEGMENTS = 5
    let segmentLength = 0
    segmentDuration = 0
    let bytesFetched = 0
    let requestedSegments: boolean[] = []

    for (let i = 0; i < TOTAL_SEGMENTS; ++i) requestedSegments[i] = false

    let mediaSource: MediaSource | null = null
    if ('MediaSource' in window && MediaSource.isTypeSupported(MIME_CODEC)) {
      mediaSource = new MediaSource()
      //console.log(mediaSource.readyState); // closed
      video.src = URL.createObjectURL(mediaSource)
      mediaSource.addEventListener('sourceopen', sourceOpen)
    } else {
      console.error('Unsupported MIME type or codec: ', MIME_CODEC)
    }

    let sourceBuffer: SourceBuffer | null = null
    
    function sourceOpen(_: Event) {
      if (mediaSource) {
        sourceBuffer = mediaSource.addSourceBuffer(MIME_CODEC)
      }
      getFileLength(assetURL, function (fileLength: number) {
        console.log((fileLength / 1024 / 1024).toFixed(2), 'MB')
        //totalLength = fileLength;
        segmentLength = Math.round(fileLength / TOTAL_SEGMENTS)
        //console.log(totalLength, segmentLength);
        fetchRange(assetURL, 0, segmentLength, appendSegment)
        requestedSegments[0] = true
        video.addEventListener('timeupdate', checkBuffer)
        video.addEventListener('canplay', function () {
          segmentDuration = video.duration / TOTAL_SEGMENTS
          video.play()
        })
        video.addEventListener('seeking', seek)
      })
    }

    function getFileLength(url: string, cb: (length: number) => void) {
      let xhr = new XMLHttpRequest()
      xhr.open('head', url)
      xhr.onload = function () {
        const length = xhr.getResponseHeader('content-length');
        cb(length ? parseInt(length, 10) : 0);
      }
      xhr.send()
    }

    function fetchRange(url: string, start: number, end: number, cb: (response: ArrayBuffer) => void) {
      let xhr = new XMLHttpRequest()
      xhr.open('get', url)
      xhr.responseType = 'arraybuffer'
      xhr.setRequestHeader('Range', 'bytes=' + start + '-' + end)
      xhr.onload = function () {
        console.log('fetched bytes: ', start, end)
        bytesFetched += end - start + 1
        cb(xhr.response)
      }
      BYTES_FETCHED = end - start + 1
      REQUESTED_SEGMENTS = `${start} - ${end}`
      xhr.send()
    }

    async function appendSegment(chunk: ArrayBuffer) {
      // await getMIME_CODEC(chunk).then((MIME_CODEC) => {
      //   console.log(`MIME codec: ${MIME_CODEC}`);
      // });
      if (sourceBuffer) {
        sourceBuffer.appendBuffer(chunk)
      } else {
        console.error('sourceBuffer is null')
      }
    }

    function checkBuffer(_: Event) {
      let currentSegment = getCurrentSegment()
      if (currentSegment === TOTAL_SEGMENTS && haveAllSegments() && mediaSource) {
        console.log('last segment', mediaSource.readyState)
        mediaSource.endOfStream()
        video.removeEventListener('timeupdate', checkBuffer)
      } else if (shouldFetchNextSegment(currentSegment)) {
        requestedSegments[currentSegment] = true
        console.log('time to fetch next chunk', video.currentTime)
        fetchRange(
          assetURL,
          bytesFetched,
          bytesFetched + segmentLength,
          appendSegment,
        )
      }
      //console.log(video.currentTime, currentSegment, segmentDuration);
    }

    function seek(e: Event) {
      if(sourceBuffer && mediaSource) {
        console.log(e)
      if (mediaSource.readyState === 'open') {
        sourceBuffer.abort()
        console.log(mediaSource.readyState)
      } else {
        console.log('seek but not open?')
        console.log(mediaSource.readyState)
      }
      } else {
        console.error('sourceBuffer is null')
      }
    }

    function getCurrentSegment() {
      CURRENT_SEGMENT = ((video.currentTime / segmentDuration) | 0) + 1
      return CURRENT_SEGMENT
    }

    function haveAllSegments() {
      return requestedSegments.every(function (val) {
        return !!val
      })
    }

    function shouldFetchNextSegment(currentSegment: number) {
      return (
        video.currentTime > segmentDuration * currentSegment * 0.8 &&
        !requestedSegments[currentSegment]
      )
    }
  })
</script>

<div>
  <h1>Hello</h1>
  <video
    id="videoElement"
    controls
    class="w-full max-w-2xl mx-auto rounded-lg border border-gray-700 shadow-lg"
  >
  </video>
  <div id="video-info" class="p-4 bg-gray-800 rounded-lg mt-4">
    <p>MIME_CODEC: <span id="MIME_CODEC">{MIME_CODEC}</span></p>
    <p>Total Segment: <span id="currentTime">{TOTAL_SEGMENTS}</span></p>
    <p>Current Segment: <span id="currentSegment">{CURRENT_SEGMENT}</span></p>
    <p>Segment Duration: <span id="segmentDuration">{segmentDuration}</span></p>
    <p>Bytes Fetched: <span id="bytesFetched">{BYTES_FETCHED}</span></p>
    <p>Requested Segments: <span id="requestedSegments">{REQUESTED_SEGMENTS}</span></p>
  </div>
</div>
