<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

import { loadImage } from '../utils'
import type { ImageData, PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  classes?: string
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
  await processImage()
})
</script>

<template>
  <img
    v-if="image"
    :src="image.src"
    class="rounded-md w-full max-w-full h-full object-cover aspect-square max-h-full"
    :class="classes"
  />

  <div v-if="!image" class="w-full aspect-square">
    <Skeleton />
  </div>
</template>
