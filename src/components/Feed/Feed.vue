<script setup lang="ts">
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'

const props = defineProps<{
  avatarSrc: string
  badgeSrc: string
  assetSrc: string
  tag: PassportItemAssetType
  name: string
  address: string
  badgeName: string
  assetLink: string
  description?: string
  frameHexColor?: string
}>()

const SKIN: PassportItemAssetType[] = ['css', 'stylesheet-link']
const CLIP: PassportItemAssetType[] = [
  'image',
  'image-link',
  'image-playable',
  'image-playable-link',
]
const BGM: PassportItemAssetType[] = ['bgm', 'bgm-link']
const VIDEO: PassportItemAssetType[] = [
  'video',
  'video-link',
  'short-video',
  'short-video-link',
]
</script>

<template>
  <div
    class="flex gap-3 p-2 rounded-xl"
    :class="{
      'bg-indigo-600':
        !frameHexColor || frameHexColor === '' ? CLIP.includes(tag) : false,
      'bg-fuchsia-500':
        !frameHexColor || frameHexColor === '' ? SKIN.includes(tag) : false,
      'bg-orange-500':
        !frameHexColor || frameHexColor === '' ? BGM.includes(tag) : false,
      'bg-yellow-500':
        !frameHexColor || frameHexColor === '' ? VIDEO.includes(tag) : false,
    }"
    :style="{
      backgroundColor: frameHexColor,
    }"
  >
    <div class="flex flex-col flex-grow">
      <div class="flex items-center gap-3">
        <a :href="`/passport/${address}`">
          <img class="w-14 h-14 rounded-full object-cover aspect-square bg-lightgray bg-cover bg-center bg-no-repeat _p-avatar" :src="avatarSrc" alt="avatar" />
        </a>
        <div class="flex flex-col flex-grow gap-0">
          <div class="text-xs font-bold">
            {{ name }}
          </div>
          <div
            class="flex items-center gap-2 p-1 rounded-sm bg-white"
            style="width: fit-content"
          >
            <img
              class="w-7 rounded-sm"
              style="aspect-ratio: 16 / 9"
              :src="badgeSrc"
              alt="image"
            />
            <p class="text-xs font-bold">{{ badgeName }}</p>
          </div>
        </div>
      </div>
      <div v-if="description" class="w-full text-2xl font-bold">
        {{ description }}
      </div>
    </div>
    <div class="flex items-end max-w-16 min-w-16">
      <a :href="assetLink">
        <img
          class="w-full rounded"
          style="aspect-ratio: 1 / 1"
          :src="assetSrc"
          alt="asset"
        />
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
