<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { ClubsData } from '@pages/api/clubs'
import type { AssetItem } from '@pages/api/profile/[id]/assets'
import Skeleton from '@components/Global/Skeleton.vue'
import { whenDefined } from '@devprotocol/util-ts'
import { decode } from '@devprotocol/clubs-core'

const props = defineProps<{
  item: AssetItem
}>()

const club = ref<ClubsData>()
const clubUrl = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).url)
})
const clubName = computed(() => {
  return whenDefined(club.value, ({ config }) => decode(config.source).name)
})

onMounted(async () => {
  club.value = await fetch(`/api/clubs?p=${props.item.propertyAddress}`)
    .then((res) => res.json())
    .then((res) => res[0])
})
</script>

<template>
  <div
    class="shadow-md rounded-md p-4 grid gap-4 bg-surface-200 border border-surface-300"
  >
    <img :src="props.item.image" class="rounded-md w-full max-w-full" />
    <span class="grid gap-1.5">
      <span>{{ props.item.name }}</span>
      <span v-if="!clubUrl" class="w-full h-3"><Skeleton /></span>
      <a v-if="clubUrl && clubName" :href="clubUrl"
        ><span class="opacity-50">{{ clubName }}</span></a
      >
    </span>
  </div>
</template>
