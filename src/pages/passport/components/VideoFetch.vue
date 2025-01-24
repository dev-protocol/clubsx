<script setup>
import { ref, onMounted, defineProps } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css' // Import Video.js default styles

// Define props similar to your old code
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  isControlled: {
    type: Boolean,
    default: false,
  },
  posterUrl: {
    default: '',
    type: String,
  },
  videoClass: {
    default: '',
    type: String,
  },
  controls: {
    default: false,
    type: Boolean,
  },
  // autoplay: {
  //   default: true,
  //   type: Boolean
  // },
  loop: {
    default: true,
    type: Boolean,
  },
  muted: {
    default: true,
    type: Boolean,
  },
  options: {
    type: Object,
    default: () => ({
      fill: false,
      fluid: false,
      preload: 'meta',
      liveui: true,
      playbackRates: [0.5, 1, 1.5, 2],
      playsinline: true,
      spatialNavigation: {
        enabled: true,
        horizontalSeek: true,
      },
      controlBar: {
        skipButtons: {
          backward: 10,
          forward: 5,
          fullscreenToggle: false,
        },
      },
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
      },
    }),
  },
})

// State & Refs
const isPaused = ref(true)
const videoEl = ref(null)
let player = null

// Called when user clicks our custom play/pause overlay
function togglePlay() {
  if (!player) return

  if (player.paused()) {
    player.play()
  } else {
    player.pause()
  }
}

// Once the component mounts, initialize Video.js
onMounted(() => {
  player = videojs(videoEl.value, {
    ...props.options,
    // Provide an HLS URL (m3u8) or fallback
    sources: [
      { src: props.url, type: 'video/mp4' },
      { src: props.url, type: 'application/x-mpegURL' },
    ],
    controls: props.controls, // for using videojs controls
    autoplay: !props.isControlled, // If not controlled, autoplay
    muted: props.muted,
    poster: props.posterUrl,
    loop: props.loop,
    // Additional Video.js options if needed
  })

  // Update `isPaused` whenever the player fires 'play' or 'pause'
  player.on('play', () => {
    isPaused.value = false
  })

  player.on('pause', () => {
    isPaused.value = true
  })
})
</script>

<template>
  <div class="relative m-0 h-full w-full cursor-pointer p-0">
    <!-- Video.js player element -->
    <video ref="videoEl" class="video-js" :class="videoClass"></video>

    <!-- Custom play/pause overlay (only if isControlled=true) -->
    <div
      v-if="isControlled"
      class="absolute inset-0 m-auto flex size-1/2 items-center justify-center text-white opacity-60"
      @click.stop.prevent="togglePlay"
    >
      <!-- Play icon -->
      <svg
        v-if="isPaused"
        class="w-full h-full"
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

      <!-- Pause icon -->
      <svg
        v-else
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
    </div>
  </div>
</template>

<style>
.video-js {
  width: 100% !important;
  height: 100% !important;
  /* Add object-fit if you want it to behave like background cover */
  object-fit: cover;
}
</style>
