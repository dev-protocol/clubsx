<script setup lang="ts">
import Feed from '@components/Feed/Feed.vue'
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'
import type { FeedType } from '../../fixtures/api/feed'

const props = defineProps<{
  feeds: FeedType[]
}>()

console.log('Feed', props.feeds.at(-1))
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2 flex-grow pb-24 h-full">
      <Feed v-for="feed in feeds" :key="feed.id" v-bind="feed" />
    </div>
  </div>
</template>
