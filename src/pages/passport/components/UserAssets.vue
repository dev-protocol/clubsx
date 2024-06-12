<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'

import { Strings } from '../i18n'
import UserAsset from './UserAsset.vue'
import Skeleton from '@components/Global/Skeleton.vue'
import type { AssetsResponse } from '@pages/api/profile/[id]/assets'

const props = defineProps<{ account: string }>()

const i18nBase = i18nFactory(Strings)
let i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

const assets = ref<AssetsResponse>()

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)

  assets.value = await fetch(`/api/profile/${props.account}/assets`).then(
    (res) => res.json(),
  )
})
</script>

<template>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      {{ i18n('Achievements') }}
      <span v-if="!assets" class="h-full w-12"><Skeleton /></span
      ><span v-if="assets" class="font-inherit text-inherit"
        >({{ assets.achievements.length }})</span
      >
    </h2>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <li
        v-if="assets?.achievements.length"
        v-for="item in assets.achievements"
      >
        <UserAsset :item="item" />
      </li>
      <div
        v-if="assets?.achievements.length === 0"
        class="rounded-md border border-surface-400 p-8 text-accent-200"
      >
        {{ i18n('Empty') }} :)
      </div>

      <li v-if="!assets" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      {{ i18n('Clubs') }}
      <span v-if="!assets" class="h-full w-12"><Skeleton /></span
      ><span v-if="assets" class="font-inherit text-inherit"
        >({{ assets.memberships.length }})</span
      >
    </h2>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <li v-if="assets?.memberships.length" v-for="item in assets.memberships">
        <UserAsset :item="item" />
      </li>
      <div
        v-if="assets?.memberships.length === 0"
        class="rounded-md border border-surface-400 p-8 text-accent-200"
      >
        {{ i18n('Empty') }} :)
      </div>
      <li v-if="!assets" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
</template>
