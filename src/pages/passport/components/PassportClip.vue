<script lang="ts" setup>
import { always } from 'ramda'
import { decodeTokenURI } from '@fixtures/nft'
import { computed, onMounted, ref } from 'vue'
import { whenDefined } from '@devprotocol/util-ts'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetDocument } from '@fixtures/api/assets/schema'
import { decode, markdownToHtml } from '@devprotocol/clubs-core'

import ImageCard from './ImageCard.vue'
import { loadImage, ABI_NFT } from '../utils'
import type { ImageData, PassportClip } from '../types'

const props = defineProps<{
  item: PassportClip
  truncate?: boolean
  classes?: string
}>()

const clubConfig = ref<string>()

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

onMounted(async () => {
  const clubApiPri = await fetchClub(`/${API_PATH}`)
  const clubApi = clubApiPri ? clubApiPri : await fetchClub(clubApiAlt.value)
  clubConfig.value = clubApi?.content ?? undefined
})
</script>

<template>
  <div
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
      :img="item.itemAssetValue"
      :type="item.itemAssetType"
      :frame-color-hex="item.frameColorHex"
    />
    <article
      v-html="description"
      :class="{ 'overflow-hidden': props.truncate ?? true }"
    ></article>
    <a v-if="clubName" :href="props.item.clubsUrl">{{ clubName }}</a>
  </div>
</template>

<style lang="scss">
article {
  &.overflow-hidden p {
    @apply truncate;
  }
}
</style>
