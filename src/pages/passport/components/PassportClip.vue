<script lang="ts" setup>
import { always } from 'ramda'
import { computed, onMounted, ref } from 'vue'
import { whenDefined } from '@devprotocol/util-ts'
import { decode, markdownToHtml } from '@devprotocol/clubs-core'
import { itemToHash } from '@fixtures/router/passportItem'

import ImageCard from './ImageCard.vue'
import type { PassportClip } from '../types'

const props = defineProps<{
  skinSection: 'spotlight' | 'clips'
  item: PassportClip
  index: number
  truncate?: boolean
  classes?: string
}>()

const clubConfig = ref<string>()
const elementId = ref<string>()

const SITE_NAME =
  new URL(props.item.clubsUrl)?.hostname?.split('.')?.at(0) ?? 'developers'
const API_PATH = `api/config/${SITE_NAME}`

const clubApiAlt = computed(() => {
  return window.location.hostname.includes('prerelease.clubs.place')
    ? `https://prerelease.clubs.place/${API_PATH}`
    : window.location.hostname.includes('clubs.place')
      ? `https://clubs.place/${API_PATH}`
      : `http://localhost:${window.location.port}/${API_PATH}`
})

const clubName = computed(() => {
  return whenDefined(clubConfig.value, (config) => decode(config).name)
})

const description = computed(() => {
  return markdownToHtml(props.item.description ?? '')
})

const fetchClub = async (api: string) => {
  return await fetch(api)
    .then((res) => res.json())
    .then((res) => res as null | { content: string | null; message: string })
    .catch(always(null))
}

const shareClip = () => {
  navigator.share({
    // please replace the title and text with the actual values
    title: 'Check out this clip!',
    text: props.item.description,
    url:
      window.location.href.split('#').at(0) +
      `#${itemToHash(props.skinSection ?? 'clips', props.index)}`,
  })
}

onMounted(async () => {
  const clubApiPri = await fetchClub(`/${API_PATH}`)
  const clubApi = clubApiPri ? clubApiPri : await fetchClub(clubApiAlt.value)
  clubConfig.value = clubApi?.content ?? undefined
  const _elementId = itemToHash(props.skinSection ?? 'clips', props.index)
  elementId.value = _elementId instanceof Error ? '' : (_elementId ?? '')
})
</script>

<template>
  <div
    :id="elementId"
    v-if="!!item"
    class="shadow-md rounded-md h-fit p-4 grid gap-4 border border-surface-300 content-between"
    :class="{
      'bg-surface-200': !item.frameColorHex,
      [props.classes ?? '']: Boolean(props.classes),
    }"
    :style="{
      backgroundColor: item.frameColorHex,
    }"
  >
    <ImageCard
      :found="!!item"
      :src="item.itemAssetValue"
      :type="item.itemAssetType"
      :frame-color-hex="item.frameColorHex"
    />

    <article
      v-if="description"
      v-html="description"
      :class="{ 'overflow-hidden': props.truncate ?? true }"
    ></article>

    <div class="flex w-full max-w-full items-center justify-between">
      <a v-if="clubName" :href="props.item.clubsUrl">{{ clubName }}</a>
      <button @click="shareClip" class="w-6 h-6 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
        >
          <circle
            cx="19.64"
            cy="4.36"
            r="2.86"
            class="stroke-miterlimit-10"
            stroke="currentColor"
            fill="currentColor"
          ></circle>
          <circle
            cx="4.36"
            cy="12"
            r="2.86"
            class="stroke-miterlimit-10"
            stroke="currentColor"
            fill="currentColor"
          ></circle>
          <circle
            cx="19.64"
            cy="19.64"
            r="2.86"
            class="stroke-miterlimit-10"
            stroke="currentColor"
            fill="currentColor"
          ></circle>
          <line
            x1="17.08"
            y1="5.64"
            x2="6.92"
            y2="10.72"
            class="stroke-miterlimit-10"
            stroke="currentColor"
          ></line>
          <line
            x1="17.08"
            y1="18.36"
            x2="6.92"
            y2="13.28"
            class="stroke-miterlimit-10"
            stroke="currentColor"
          ></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
article {
  &.overflow-hidden p {
    @apply truncate;
  }
}
</style>
