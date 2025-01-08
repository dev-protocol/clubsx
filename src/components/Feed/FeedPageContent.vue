<script setup lang="ts">
import avatar01 from '@assets/feed/avatar01.png'
import image01 from '@assets/feed/image01.png'
import asset01 from '@assets/feed/asset01.png'
import Feed from '@components/Feed/Feed.vue'
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'

const feeds = <
  {
    avatarSrc: string
    badgeSrc: string
    assetSrc: string
    tag: PassportItemAssetType
    name: string
    badgeName: string
    description?: string
  }[]
>[
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: 'video',
    name: 'Longname_Longname',
    badgeName: 'GiruGuru',
    description: 'Wishing for the release of a new season…🙏⭐✨',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: 'image',
    name: 'Longname_Longname',
    badgeName: 'Viee',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: '',
    name: '_example when no bg color_',
    badgeName: 'Track the Risk',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: 'css',
    name: 'Longname_Longname',
    badgeName: 'GiruGuru',
    description: 'Getting Kawaii energy from this clip🤤🤤🤤',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: 'bgm',
    name: 'Longname_Longname',
    badgeName: 'Bravo!',
    description: 'Oh no, Azami-chan is scared 😂',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: '',
    name: 'Longname_Longname',
    badgeName: 'Tokyo Night',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: '',
    name: 'Longname_Longname',
    badgeName: 'GiruGuru',
    description: 'Wishing for the release of a new season…🙏⭐✨',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: '',
    name: 'Longname_Longname',
    badgeName: 'GiruGuru',
    description: 'Wishing for the release of a new season…🙏⭐✨',
  },
  {
    avatarSrc: avatar01.src,
    badgeSrc: image01.src,
    assetSrc: asset01.src,
    tag: '',
    name: 'Longname_Longname',
    badgeName: 'GiruGuru',
    description: 'Wishing for the release of a new season…🙏⭐✨',
  },
]
</script>
<template>
  <div class="flex flex-col px-2 h-full">
    <p class="text-base font-bold">Latest updates</p>
    <div class="flex flex-col gap-2 flex-grow h-full overflow-y-auto">
      <Feed v-for="feed in feeds" :key="feed.name" v-bind="feed" />
    </div>
  </div>
</template>
