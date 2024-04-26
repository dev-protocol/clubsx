<script lang="ts" setup>
import type { AssetsResponse } from '@pages/api/profile/[id]/assets'
import Skeleton from '@components/Global/Skeleton.vue'
import UserAsset from './UserAsset.vue'
import { onMounted, ref } from 'vue'

const props = defineProps<{ account: string }>()

const assets = ref<AssetsResponse>()

onMounted(async () => {
  assets.value = await fetch(`/api/profile/${props.account}/assets`).then(
    (res) => res.json(),
  )
})
</script>

<template>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      Achivements <span v-if="!assets" class="h-full w-12"><Skeleton /></span
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
        Empty :)
      </div>

      <li v-if="!assets" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
  <section class="grid gap-8">
    <h2 class="font-bold text-3xl flex items-center gap-2">
      Clubs <span v-if="!assets" class="h-full w-12"><Skeleton /></span
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
        Empty :)
      </div>
      <li v-if="!assets" v-for="item in new Array(6)">
        <span class="block h-96"><Skeleton /></span>
      </li>
    </ul>
  </section>
</template>
