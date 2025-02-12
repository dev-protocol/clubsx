<script lang="ts" setup>
import { computed, defineProps, onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

import { VideoFetch } from '@devprotocol/clubs-core/ui/vue'

import type { PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
  class?: string
  videoClass?: string
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const backdropRef = ref<HTMLImageElement | null>(null)
const isImageType = computed(
  () =>
    props.type === 'image' ||
    props.type === 'image-link' ||
    props.type === 'image-playable' ||
    props.type === 'image-playable-link',
)

onMounted(async () => {
  try {
    const response = await fetch(props.src)
    const blob = await response.blob()
    const blobDataUrl = URL.createObjectURL(blob)
    if (isImageType.value && imageRef.value && backdropRef.value) {
      imageRef.value.src = blobDataUrl ? blobDataUrl : (props.posterSrc ?? '')
      backdropRef.value.src = blobDataUrl
        ? blobDataUrl
        : (props.posterSrc ?? '')
    }
  } catch (error) {
    console.error('Error loading video:', error)
  }
})
</script>

<template>
  <div
    :class="{
      'relative rounded-md outline-2 outline-offset-2 outline outline-solid outline-violet-500': false /* trial 1 */,
      'relative overflow-hidden rounded-md': true /* trial 2, 3 */,
    }"
  >
    <img
      alt="Passport clip backdrop"
      ref="backdropRef"
      v-if="found && isImageType"
      class="absolute w-full h-full blur-sm origin-center scale-150"
    />
    <span
      :class="{
        'text-[0.65rem] px-1 rounded-t-md bg-violet-500 text-white absolute left-2 -top-[calc(4px_+_1lh)] flex items-center gap-1': false /* trial 1 */,
        'z-10 text-xs px-1 rounded-md border border-white/30 bg-black/30 backdrop-blur-sm text-white absolute left-1 top-1 flex items-center gap-1': false /* trial 2 */,
        'z-10 text-xs px-1 rounded-md outline outline-solid outline-1 outline-white/80 __bg__ text-white absolute left-1 top-1 flex items-center gap-1': true /* trial 3 */,
      }"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-3"
      >
        <path
          fill-rule="evenodd"
          d="M15 8c0 .982-.472 1.854-1.202 2.402a2.995 2.995 0 0 1-.848 2.547 2.995 2.995 0 0 1-2.548.849A2.996 2.996 0 0 1 8 15a2.996 2.996 0 0 1-2.402-1.202 2.995 2.995 0 0 1-2.547-.848 2.995 2.995 0 0 1-.849-2.548A2.996 2.996 0 0 1 1 8c0-.982.472-1.854 1.202-2.402a2.995 2.995 0 0 1 .848-2.547 2.995 2.995 0 0 1 2.548-.849A2.995 2.995 0 0 1 8 1c.982 0 1.854.472 2.402 1.202a2.995 2.995 0 0 1 2.547.848c.695.695.978 1.645.849 2.548A2.996 2.996 0 0 1 15 8Zm-3.291-2.843a.75.75 0 0 1 .135 1.052l-4.25 5.5a.75.75 0 0 1-1.151.043l-2.25-2.5a.75.75 0 1 1 1.114-1.004l1.65 1.832 3.7-4.789a.75.75 0 0 1 1.052-.134Z"
          clip-rule="evenodd"
        />
      </svg>
      Official</span
    >
    <!-- Image type clip -->
    <img
      alt="Passport clip"
      ref="imageRef"
      v-if="found && isImageType"
      class="relative rounded-md w-full max-w-full object-cover [&:not([src])]:aspect-square"
      :class="props.class"
    />

    <!-- Short video type clip -->
    <VideoFetch
      v-if="found && type.includes('short-video')"
      :url="src"
      :posterUrl="posterSrc ?? ''"
      class="relative"
      :class="class"
      :videoClass="[
        `rounded-md w-full max-w-full object-cover aspect-square pointer-events-none`,
        { [videoClass ?? '']: Boolean(videoClass) },
      ]"
      :isControlled="
        type === 'short-video-controlled' ||
        type === 'short-video-controlled-link'
      "
    />

    <div v-if="!found || !props.src" class="w-full aspect-square">
      <Skeleton />
    </div>
  </div>
</template>

<style scoped>
.__bg__ {
  background: radial-gradient(
      ellipse farthest-corner at right bottom,
      #fedb37 0%,
      #fdb931 8%,
      #9f7928 30%,
      #8a6e2f 40%,
      transparent 80%
    ),
    radial-gradient(
      ellipse farthest-corner at left top,
      #ffffff 0%,
      #ffffac 8%,
      #d1b464 25%,
      #5d4a1f 62.5%,
      #5d4a1f 100%
    );
}
</style>
