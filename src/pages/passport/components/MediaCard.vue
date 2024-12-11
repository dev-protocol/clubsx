<script lang="ts" setup>
import Skeleton from '@components/Global/Skeleton.vue'
import { defineProps, onMounted } from 'vue'

import type { PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
  class?: string
}>()
let video: HTMLVideoElement | null = null
if (props.type === 'short-video' || props.type === 'short-video-link') {
  onMounted(async() => {
    video = document.querySelector('video')

    try {
        const response = await fetch(props.src);
        const blob = await response.blob();
        const blobDataUrl = URL.createObjectURL(blob);
        video.src = blobDataUrl;
      } catch (error) {
        console.error('Error loading video:', error);
      }
  })
}
</script>

<template>
  <!-- Image type clip -->
  <img
    alt="Passport clip"
    :src="src ?? posterSrc"
    v-if="
      found &&
      (type === 'image' ||
        type === 'image-link' ||
        type === 'image-playable' ||
        type === 'image-playable-link')
    "
    class="rounded-md w-full max-w-full object-cover aspect-square"
    :class="props.class"
  />

  <!-- Short video type clip -->
  <video
    loop
    muted
    autoplay
    :poster="posterSrc ?? ''"
    v-if="found && (type === 'short-video' || type === 'short-video-link')"
    class="rounded-md w-full max-w-full object-cover aspect-square pointer-events-none"
    :class="props.class"
  >
    <track kind="captions" />
  </video>

  <div v-if="!found || !props.src" class="w-full aspect-square">
    <Skeleton />
  </div>
</template>
