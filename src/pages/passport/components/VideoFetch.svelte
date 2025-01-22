<script>
  import { onMount } from 'svelte'
  import videojs from 'video.js'
  import 'video.js/dist/video-js.css'

  // Props
  export let url
  export let isControlled = false
  export let posterUrl = ''
  export let videoClass = ''
  export let controls = false
  // export let autoplay = true;
  export let loop = true
  export let muted = true
  export let options = {
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
  }

  // State
  let isPaused = true
  let videoEl // This will reference <video> in the DOM
  let player // video.js player instance

  function togglePlay() {
    if (!player) return
    if (player.paused()) {
      player.play()
    } else {
      player.pause()
    }
  }

  onMount(() => {
    player = videojs(videoEl, {
      ...options,
      sources: [
        { src: url, type: 'video/mp4' },
        { src: url, type: 'application/x-mpegURL' },
      ],
      controls,
      autoplay: !isControlled, // If not controlled, autoplay
      muted,
      poster: posterUrl,
      loop,
    })

    // Update isPaused whenever the player fires 'play' or 'pause'
    player.on('play', () => {
      isPaused = false
    })

    player.on('pause', () => {
      isPaused = true
    })

    // Cleanup when component unmounts
    return () => {
      if (player) {
        player.dispose()
      }
    }
  })
</script>

<!-- TEMPLATE -->
<div class="relative m-0 h-full w-full cursor-pointer p-0">
  <!-- Video.js player element -->
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={videoEl} class="video-js {videoClass}"></video>

  <!-- Custom play/pause overlay (only if isControlled=true) -->
  {#if isControlled}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="absolute inset-0 m-auto flex size-1/2 items-center justify-center text-white opacity-60"
      on:click|stopPropagation|preventDefault={togglePlay}
    >
      <!-- Play icon -->
      {#if isPaused}
        <svg
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
      {:else}
        <!-- Pause icon -->
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-full"
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
    </div>
  {/if}
</div>

<style>
  .video-js {
    width: 100% !important;
    height: 100% !important;
    /* Add object-fit if you want it to behave like background cover */
    object-fit: cover;
  }
</style>
