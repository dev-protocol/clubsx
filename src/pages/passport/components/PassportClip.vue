<script lang="ts" setup>
import { always } from 'ramda'
import { decodeTokenURI } from '@fixtures/nft'
import { computed, onMounted, ref } from 'vue'
import { decode } from '@devprotocol/clubs-core'
import type { ClubsData } from '@pages/api/clubs'
import { whenDefined } from '@devprotocol/util-ts'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetDocument } from '@fixtures/api/assets/schema'

import ImageCard from './ImageCard.vue'
import { loadImage, ABI_NFT } from '../utils'
import type { ImageData, PassportClip } from '../types'

const props = defineProps<{
  item: PassportClip
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
  return whenDefined(
    clubConfig.value,
    ({ config }) => decode(clubConfig.value).name,
  )
})

const fetchClub = async (api: string) => {
  return await fetch(api)
    .then((res) => res.json())
    .then((res) => res as null | ClubsData)
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
    :class="`shadow-md rounded-md p-4 grid gap-4 border border-surface-300 ${item.frameColorHex ? '' : 'bg-surface-200'}`"
    :style="{
      backgroundColor: item.frameColorHex,
    }"
  >
    <ImageCard
      :found="!!item"
      :img="item.itemAssetValue"
      :type="item.itemAssetType"
      :classes="'aspect-square'"
      :frame-color-hex="item.frameColorHex"
    />
    <p v-html="item.description"></p>
    <a v-if="clubName" :href="props.item.clubsUrl">{{ clubName }}</a>
  </div>
</template>
