<script lang="ts">
  import { onMount } from 'svelte'
  import { FFmpeg } from '@ffmpeg/ffmpeg'
  import { fetchFile, toBlobURL } from '@ffmpeg/util'

  const ffmpegRef = new FFmpeg()

  // async function getMimeCodec(videoChunk) {
  //   // Load FFmpeg
  //   if (!ffmpeg.isLoaded()) {
  //     await ffmpeg.load();
  //   }

  //   // Write the video chunk to FFmpeg's virtual file system
  //   ffmpeg.FS('writeFile', 'input_video', await fetchFile(videoChunk));

  //   // Run FFprobe to get metadata
  //   await ffmpeg.run('-i', 'input_video');

  //   // Read the FFmpeg logs to extract codec information
  //   const logs = ffmpeg.logs;
  //   let containerFormat = '';
  //   let videoCodec = '';
  //   let audioCodec = '';

  //   for (const log of logs) {
  //     // Extract container format
  //     if (!containerFormat) {
  //       const formatMatch = log.message.match(/Input #0, (\w+),/);
  //       if (formatMatch) {
  //         containerFormat = formatMatch[1];
  //       }
  //     }

  //     // Extract video codec
  //     if (!videoCodec) {
  //       const videoMatch = log.message.match(/Video: (\w+)/);
  //       if (videoMatch) {
  //         videoCodec = videoMatch[1];
  //       }
  //     }

  //     // Extract audio codec
  //     if (!audioCodec) {
  //       const audioMatch = log.message.match(/Audio: (\w+)/);
  //       if (audioMatch) {
  //         audioCodec = audioMatch[1];
  //       }
  //     }

  //     // Break the loop if all information is gathered
  //     if (containerFormat && videoCodec && audioCodec) {
  //       break;
  //     }
  //   }

  //   // Map container format to MIME type
  //   const mimeTypes = {
  //     mov: 'video/quicktime',
  //     mp4: 'video/mp4',
  //     mkv: 'video/x-matroska',
  //     avi: 'video/x-msvideo',
  //     // Add more mappings as needed
  //   };

  //   const mimeType = mimeTypes[containerFormat] || 'application/octet-stream';

  //   // Map codecs to MIME codecs
  //   const codecMappings = {
  //     h264: 'avc1.42E01E',
  //     aac: 'mp4a.40.2',
  //     // Add more mappings as needed
  //   };

  //   const videoCodecMime = codecMappings[videoCodec.toLowerCase()] || videoCodec;
  //   const audioCodecMime = codecMappings[audioCodec.toLowerCase()] || audioCodec;

  //   // Construct the MIME codec string
  //   const mimeCodec = `${mimeType}; codecs="${videoCodecMime}, ${audioCodecMime}"`;

  //   return mimeCodec;
  // }

  // // Usage example
  // const videoChunk = 'path/to/video/chunk';
  // getMimeCodec(videoChunk).then((mimeCodec) => {
  //   console.log(`MIME codec: ${mimeCodec}`);
  // });

  onMount(async () => {
    if (!window.MediaSource) {
      console.error('MediaSource API is not supported in this browser.')
      alert('MediaSource API is not supported in this browser.')
      return
    }

    const video = document.getElementById('videoElement')
    const assetURL =
      'https://e54a8car3bcq7q8h.public.blob.vercel-storage.com/frag_bunny-ZJaX6ShbMi5ciqThXkW4zyuynptZcT.mp4'
    // Need to be specific for Blink regarding codecs
    // ./mp4info frag_bunny.mp4 | grep Codec
    var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    var totalSegments = 5
    var segmentLength = 0
    var segmentDuration = 0
    var bytesFetched = 0
    var requestedSegments = []

    for (var i = 0; i < totalSegments; ++i) requestedSegments[i] = false

    var mediaSource = null
    if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
      mediaSource = new MediaSource()
      //console.log(mediaSource.readyState); // closed
      video.src = URL.createObjectURL(mediaSource)
      mediaSource.addEventListener('sourceopen', sourceOpen)
    } else {
      console.error('Unsupported MIME type or codec: ', mimeCodec)
    }

    var sourceBuffer = null
    function sourceOpen(_) {
      sourceBuffer = mediaSource.addSourceBuffer(mimeCodec)
      getFileLength(assetURL, function (fileLength) {
        console.log((fileLength / 1024 / 1024).toFixed(2), 'MB')
        //totalLength = fileLength;
        segmentLength = Math.round(fileLength / totalSegments)
        //console.log(totalLength, segmentLength);
        fetchRange(assetURL, 0, segmentLength, appendSegment)
        requestedSegments[0] = true
        video.addEventListener('timeupdate', checkBuffer)
        video.addEventListener('canplay', function () {
          segmentDuration = video.duration / totalSegments
          video.play()
        })
        video.addEventListener('seeking', seek)
      })
    }

    function getFileLength(url, cb) {
      var xhr = new XMLHttpRequest()
      xhr.open('head', url)
      xhr.onload = function () {
        cb(xhr.getResponseHeader('content-length'))
      }
      xhr.send()
    }

    function fetchRange(url, start, end, cb) {
      var xhr = new XMLHttpRequest()
      xhr.open('get', url)
      xhr.responseType = 'arraybuffer'
      xhr.setRequestHeader('Range', 'bytes=' + start + '-' + end)
      xhr.onload = function () {
        console.log('fetched bytes: ', start, end)
        bytesFetched += end - start + 1
        cb(xhr.response)
      }
      xhr.send()
    }

    async function appendSegment(chunk) {
      // await getMimeCodec(chunk).then((mimeCodec) => {
      //   console.log(`MIME codec: ${mimeCodec}`);
      // });
      sourceBuffer.appendBuffer(chunk)
    }

    function checkBuffer(_) {
      var currentSegment = getCurrentSegment()
      if (currentSegment === totalSegments && haveAllSegments()) {
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

    function seek(e) {
      console.log(e)
      if (mediaSource.readyState === 'open') {
        sourceBuffer.abort()
        console.log(mediaSource.readyState)
      } else {
        console.log('seek but not open?')
        console.log(mediaSource.readyState)
      }
    }

    function getCurrentSegment() {
      return ((video.currentTime / segmentDuration) | 0) + 1
    }

    function haveAllSegments() {
      return requestedSegments.every(function (val) {
        return !!val
      })
    }

    function shouldFetchNextSegment(currentSegment) {
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
    <p>mimeCodec:<span id="mimeCodec">0</span></p>
    <p>Current Time: <span id="currentTime">0</span></p>
    <p>Current Segment: <span id="currentSegment">0</span></p>
    <p>Segment Duration: <span id="segmentDuration">0</span></p>
    <p>Bytes Fetched: <span id="bytesFetched">0</span></p>
    <p>Requested Segments: <span id="requestedSegments">0</span></p>
  </div>
</div>
