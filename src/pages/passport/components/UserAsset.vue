<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { decode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'

import type { ClubsData } from '@pages/api/clubs'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetDocument } from '@fixtures/api/assets/schema'
import { decodeTokenURI } from '@fixtures/nft'
import { Contract, type ContractRunner } from 'ethers'
import { always } from 'ramda'
import type { ImageData } from '../types'
import { loadImage } from '../utils'

const props = defineProps<{
  item: AssetDocument
  provider: ContractRunner
  local: boolean
}>()

const ABI_NFT = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function tokenURI(uint256) view returns(string)',
]

const club = ref<ClubsData>()
const assetName = ref<string>()
const assetImage = ref<ImageData>()
const notFound = ref<boolean>(false)
const clubUrl = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).url)
})
const clubName = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).name)
})
const clubApiAlt = computed(
  () =>
    `${props.local ? 'https://clubs.place' : 'https://prerelease.clubs.place'}/api/clubs?p=${props.item.propertyAddress}`,
)

const contract = new Contract(props.item.contract, ABI_NFT, props.provider)

onMounted(async () => {
  const [clubApiPri, uri] = await Promise.all([
    fetch(`/api/clubs?p=${props.item.propertyAddress}`)
      .then((res) => res.json())
      .then((res) => res[0] as null | ClubsData)
      .catch(always(null)),
    whenDefined(props.item.id, async (id) =>
      decodeTokenURI(
        await contract.tokenURI(id),
        (cid) => `https://${cid}.ipfs.nftstorage.link`,
      ),
    ),
  ])
  const clubApi = clubApiPri
    ? clubApiPri
    : await fetch(clubApiAlt.value)
        .then((res) => res.json())
        .then((res) => res[0] as null | ClubsData)
        .catch(always(null))
  club.value = clubApi ? clubApi : undefined
  notFound.value = !clubApi
  assetName.value = uri?.name
  assetImage.value = notFound.value
    ? undefined
    : await whenDefined(uri?.htmlImageSrc, loadImage)
})
</script>

<template>
  <div
    v-if="!notFound"
    class="shadow-md rounded-md p-4 grid gap-4 bg-surface-200 border border-surface-300"
  >
    <img
      v-if="assetImage"
      :src="assetImage.src"
      class="rounded-md w-full max-w-full"
    />
    <div v-if="!assetImage" class="w-full aspect-square">
      <Skeleton />
    </div>
    <span class="grid gap-1.5">
      <span>{{ assetName }}</span>
      <span v-if="!clubUrl" class="w-full h-3"><Skeleton /></span>
      <a v-if="clubUrl && clubName" :href="clubUrl"
        ><span class="opacity-50">{{ clubName }}</span></a
      >
    </span>
  </div>
</template>
