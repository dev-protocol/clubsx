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

const mappedFeeds: {
  avatarSrc: string
  badgeSrc: string
  assetSrc: string
  tag: PassportItemAssetType
  name: string
  address: string
  badgeName: string
  description?: string
  assetLink: string
}[] = props.feeds.map((feed) => {
  return {
    avatarSrc: feed.ownerDetails.avatar,
    badgeSrc: feed.clubDetails.avatar,
    assetSrc: feed.passportDetails.itemPreviewImgSrc,
    tag: feed.passportDetails.itemAssetType as PassportItemAssetType,
    name: feed.ownerDetails.username,
    address: feed.ownerDetails.address,
    badgeName: feed.clubDetails.name,
    assetLink: feed.passportDetails.itemLink,
    description: feed.passportDetails.itemDescription,
  }
})

console.log('Feed', mappedFeeds.at(0), props.feeds.at(0))
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2 flex-grow pb-24 h-full">
      <Feed v-for="feed in mappedFeeds" :key="feed.name" v-bind="feed" />
    </div>
  </div>
</template>
