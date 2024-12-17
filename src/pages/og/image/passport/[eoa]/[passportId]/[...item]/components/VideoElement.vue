<script lang="ts" setup>
import { defineProps, onMounted, ref } from 'vue'

const props = defineProps<{
  poster: string
  src: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
onMounted(async () => {
  if (videoRef.value) {
    try {
      const response = await fetch(props.src)
      const blob = await response.blob()
      const blobDataUrl = URL.createObjectURL(blob)
      videoRef.value.src = blobDataUrl
      videoRef.value.currentTime = 5
    } catch (error) {
      console.error('Error loading video:', error)
    }
  }
})
</script>

<template>
  <video
    ref="videoRef"
    loop
    muted
    autoplay
    controlsList="nodownload"
    :poster="poster"
    class="w-full h-full object-cover rounded-xl"
  ></video>
</template>
