<script setup lang="ts">
import Feed from '@components/Feed/Feed.vue'
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'

export type FeedType = {
  clubDetails: {
    url: string
    name: string
    avatar: string
  }
  ownerDetails: {
    address: string
    avatar: string
    username: string
  }
  passportDetails: {
    id: string
    itemAssetType: string
    itemLink: string
    itemDescription: string
    itemFrameColorHex: string
    itemPreviewImgSrc: string
  }
}

const props = defineProps<{
  feeds: FeedType[]
}>()

console.log('Feed', props.feeds.at(2))
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2 flex-grow pb-24 h-full">
      <Feed v-for="feed in feeds" :key="feed.name" v-bind="feed" />
    </div>
  </div>
</template>
