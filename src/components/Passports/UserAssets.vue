<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { JsonRpcProvider } from 'ethers'
import { i18nFactory } from '@devprotocol/clubs-core'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetDocument } from '@fixtures/api/assets/schema'

import { Strings } from '../../pages/passport/i18n'
import UserAsset from './UserAsset.vue'

const { PUBLIC_ALCHEMY_KEY } = import.meta.env
const i18nBase = i18nFactory(Strings)
const rpcProvider = new JsonRpcProvider(
  `https://polygon-mainnet.g.alchemy.com/v2/${PUBLIC_ALCHEMY_KEY}`,
)

const props = defineProps<{ account: string; local: boolean }>()

let i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

const assetsNft = ref<AssetDocument[]>()
const assetsSbt = ref<AssetDocument[]>()

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)

  const [nfts, sbts] = await Promise.all([
    fetch(
      `https://clubs.place/api/assets/related/account/${props.account}/?type=nft&size=999`,
    ).then((res) => res.json()),
    fetch(
      `https://clubs.place/api/assets/related/account/${props.account}/?type=sbt&size=999`,
    ).then((res) => res.json()),
  ])

  assetsNft.value = nfts.data
  assetsSbt.value = sbts.data
})
</script>

<template>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      {{ i18n('Achievements') }}
      <span v-if="!assetsSbt" class="h-full w-12"><Skeleton /></span
      ><span v-if="assetsSbt" class="font-inherit text-inherit"
        >({{ assetsSbt.length }})</span
      >
    </h2>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <li
        v-if="assetsSbt?.length"
        v-for="item in assetsSbt"
        class="empty:hidden"
      >
        <UserAsset :item="item" :provider="rpcProvider" :local="props.local" />
      </li>
      <div
        v-if="assetsSbt?.length === 0"
        class="rounded-md border border-surface-400 p-8 text-accent-200"
      >
        {{ i18n('Empty') }} :)
      </div>

      <li v-if="!assetsSbt" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      {{ i18n('Clubs') }}
      <span v-if="!assetsNft" class="h-full w-12"><Skeleton /></span
      ><span v-if="assetsNft" class="font-inherit text-inherit"
        >({{ assetsNft?.length }})</span
      >
    </h2>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <li
        v-if="assetsNft?.length"
        v-for="item in assetsNft"
        class="empty:hidden"
      >
        <UserAsset :item="item" :provider="rpcProvider" :local="props.local" />
      </li>
      <div
        v-if="assetsNft?.length === 0"
        class="rounded-md border border-surface-400 p-8 text-accent-200"
      >
        {{ i18n('Empty') }} :)
      </div>
      <li v-if="!assetsNft" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
</template>
