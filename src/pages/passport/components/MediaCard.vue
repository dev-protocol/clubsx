<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

import { loadImage } from '../utils'
import type { ImageData, PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  classes?: string
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
}>()

const image = ref<ImageData>()

const processImage = async () => {
  if (props.type === 'image-link') {
    image.value = {
      src: props.src,
      w: 324,
      h: 324,
      alt: props.type ?? 'Image',
    } as ImageData
  }

  const loadedImage = await loadImage(props.src)
  image.value = loadedImage
}

onMounted(async () => {
  if (props.type === 'image' || props.type === 'image-link') {
    await processImage()
  }
})
</script>

<template>
  <img
    v-if="image && (type === 'image' || type === 'image-link')"
    :src="image.src"
    class="rounded-md w-full max-w-full h-full object-cover aspect-square max-h-full"
    :class="classes"
  />

  <video
    v-if="props.src && (type === 'short-video' || type === 'short-video-link')"
    autoplay
    muted
    loop
    :poster="props.posterSrc ?? ''"
    class="rounded-md w-full max-w-full h-full object-fill aspect-square max-h-full pointer-events-none"
    :src="props.src"
  >
    <track kind="captions" />
  </video>

  <div v-if="!image && !props.src" class="w-full aspect-square">
    <Skeleton />
  </div>
</template>
