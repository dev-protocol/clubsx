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

const club = ref<ClubsData>()

const clubUrl = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).url)
})

const clubName = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).name)
})

const clubApiAlt = computed(() => {
  const path = `api/clubs?p=${props.item.propertyAddress}`
  return window.location.hostname.includes('prerelease.clubs.place')
    ? `https://prerelease.clubs.place/${path}`
    : window.location.hostname.includes('clubs.place')
      ? `https://clubs.place/${path}`
      : `http://localhost:${window.location.port}/${path}`
})

const fetchClub = async (api: string) => {
  return await fetch(api)
    .then((res) => res.json())
    .then((res) => res[0] as null | ClubsData)
    .catch(always(null))
}

onMounted(async () => {
  const clubApiPri = await fetchClub(
    `/api/clubs?p=${props.item.propertyAddress}`,
  )
  const clubApi = clubApiPri ? clubApiPri : await fetchClub(clubApiAlt.value)

  club.value = clubApi ? clubApi : undefined
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
    <a v-if="clubName" :href="clubUrl">{{ clubName }}</a>
  </div>
</template>
