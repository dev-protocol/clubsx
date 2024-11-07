<script lang="ts" setup>
import Skeleton from '@components/Global/Skeleton.vue'

import type { PassportItemIndexDoc } from '../types'

const props = defineProps<{
  src: string
  found: boolean
  posterSrc?: string
  type: PassportItemIndexDoc['itemAssetType']
  class?: string
}>()
</script>

<template>
  <!-- Image type clip -->
  <img
    alt="Passport clip"
    :src="src ?? posterSrc"
    v-if="found && (type === 'image' || type === 'image-link')"
    class="rounded-md w-full max-w-full object-cover aspect-square"
    :class="props.class"
  />

  <!-- Short video type clip -->
  <video
    loop
    muted
    autoplay
    :src="src"
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
