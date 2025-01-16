<script lang="ts" setup>
import { defineProps, onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

import VideoFetch from './VideoFetch.vue'

import type { PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
  class?: string
}>()

const imageRef = ref<HTMLImageElement | null>(null)

onMounted(async () => {
  try {
    if (
      (props.type === 'image' ||
        props.type === 'image-link' ||
        props.type === 'image-playable' ||
        props.type === 'image-playable-link') &&
      imageRef.value
    ) {
      const response = await fetch(props.src)
      const blob = await response.blob()
      const blobDataUrl = URL.createObjectURL(blob)
      imageRef.value.src = blobDataUrl ? blobDataUrl : (props.posterSrc ?? '')
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
  <VideoFetch
    v-if="found && type.includes('short-video')"
    :url="src"
    :posterUrl="posterSrc ?? ''"
    :class="class"
    :videoClass="`rounded-md w-full max-w-full object-cover aspect-square pointer-events-none`"
    :isControlled="
      type === 'short-video-controlled' ||
      type === 'short-video-controlled-link'
    "
  />

  <div v-if="!found || !props.src" class="w-full aspect-square">
    <Skeleton />
  </div>
</template>
