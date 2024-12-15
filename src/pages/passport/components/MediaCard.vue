<script lang="ts" setup>
import { defineProps, onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

import type { PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
  class?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

onMounted(async () => {
  try {
    const response = await fetch(props.src)
    const blob = await response.blob()
    const blobDataUrl = URL.createObjectURL(blob)
    if (
      (props.type === 'short-video' || props.type === 'short-video-link') &&
      videoRef.value
    ) {
      videoRef.value.src = blobDataUrl
    }
    if (
      (props.type === 'image' ||
        props.type === 'image-link' ||
        props.type === 'image-playable' ||
        props.type === 'image-playable-link') &&
      imageRef.value
    ) {
      imageRef.value.src = blobDataUrl ? blobDataUrl : (props.posterSrc ?? '' )
    }
  } catch (error) {
    console.error('Error loading video:', error)
  }
})
</script>

<template>
  <!-- Image type clip -->
  <img
    alt="Passport clip"
    ref="imageRef"
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
    ref="videoRef"
    loop
    muted
    autoplay
    controlsList="nodownload"
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
