<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { decode } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'

import type { ClubsData } from '@pages/api/clubs'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetDocument } from '@fixtures/api/assets/schema'
import { decodeTokenURI } from '@fixtures/nft'
import { Contract, type ContractRunner } from 'ethers'

const props = defineProps<{
  item: AssetDocument
  provider: ContractRunner
}>()

const ABI_NFT = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function tokenURI(uint256) view returns(string)',
]

const club = ref<ClubsData>()
const assetName = ref<string>()
const assetImage = ref<string>()
const clubUrl = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).url)
})
const clubName = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).name)
})

const contract = new Contract(props.item.contract, ABI_NFT, props.provider)

onMounted(async () => {
  const [clubApi, uri] = await Promise.all([
    fetch(`/api/clubs?p=${props.item.propertyAddress}`)
      .then((res) => res.json())
      .then((res) => res[0]),
    whenDefined(props.item.id, async (id) =>
      decodeTokenURI(await contract.tokenURI(id)),
    ),
  ])
  club.value = clubApi
  assetName.value = uri?.name
  assetImage.value = uri?.image
})
</script>

<template>
  <div
    class="shadow-md rounded-md p-4 grid gap-4 bg-surface-200 border border-surface-300"
  >
    <img :src="assetImage" class="rounded-md w-full max-w-full" />
    <span class="grid gap-1.5">
      <span>{{ assetName }}</span>
      <span v-if="!clubUrl" class="w-full h-3"><Skeleton /></span>
      <a v-if="clubUrl && clubName" :href="clubUrl"
        ><span class="opacity-50">{{ clubName }}</span></a
      >
    </span>
  </div>
</template>
