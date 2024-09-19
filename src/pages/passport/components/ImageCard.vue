<script lang="ts" setup>
import { loadImage } from '../utils'
import { onMounted, ref } from 'vue'
import type { ImageData, PassportItemIndexDoc } from '../types'
import Skeleton from '@components/Global/Skeleton.vue'

const props = defineProps<{
  img: string
  found: boolean
  type: PassportItemIndexDoc['itemAssetType']
  classes?: string
}>()

const image = ref<ImageData>()

const processImage = async () => {
  if (props.type === 'image-link') {
    image.value = {
      src: props.img,
      w: 324,
      h: 324,
      alt: props.type ?? 'Image',
    } as ImageData
  }

  const loadedImage = await loadImage(props.img)
  image.value = loadedImage
}

onMounted(async () => {
  await processImage()
})
</script>

<template>
  <div
    v-if="found"
    class="shadow-md rounded-md p-4 grid gap-4 bg-surface-200 border border-surface-300"
  >
    <img
      v-if="image"
      :src="image.src"
      class="rounded-md w-full max-w-full h-full max-h-full"
      :class="classes"
    />

    <div v-if="!image" class="w-full aspect-square">
      <Skeleton />
    </div>
  </div>
</template>
