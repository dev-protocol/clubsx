<script setup lang="ts">
import MediaCard from '@pages/passport/components/MediaCard.vue'
import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/vue'
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'
import type { FeedType } from '@fixtures/api/feed'
import { computed, onMounted, ref } from 'vue'
import { itemToHash } from '@fixtures/router/passportItem'

const props = defineProps<FeedType>()

const assetLink = computed(
  () =>
    `/passport/${props.address}/${props.parentPassportIndex === 0 ? '' : props.parentPassport.id}?i=${itemToHash(props.clipType, props.item.id)}`,
)
</script>

<template>
  <div class="grid gap-2 p-2 h-full border-b boder-black/20">
    <div class="grid grid-cols-[auto_1fr] items-center gap-3">
      <a :href="`/passport/${address}`">
        <img
          class="w-12 h-12 rounded-full object-cover aspect-square bg-lightgray bg-cover bg-center bg-no-repeat _p-avatar"
          :src="avatarSrc"
          alt="avatar"
        />
      </a>
      <div class="grid grid-flow-col items-center justify-start gap-1">
        <span class="grid grid-flow-col items-center justify-start gap-2">
          <span class="text-xs font-bold truncate">
            {{ name }}
          </span>
          <span class="text-xs" v-if="props.parentPassport.description">·</span>
          <span class="text-xs truncate">
            {{ props.parentPassport.description?.replace(/\\n/g, ' ') }}
          </span>
        </span>
      </div>
    </div>

    <div class="flex-grow grid gap-2 grid-cols-2 rounded">
      <div class="flex flex-col gap-1">
        <p
          v-if="description"
          class="text-2xl font-bold text-ellipsis overflow-hidden line-clamp-5 lg:line-clamp-8"
        >
          {{ description }}
          <span
            v-if="props.item.tags"
            v-for="tag in props.item.tags"
            class="text-sm text-violet-500 mr-1 last:mr-0"
            >#{{ tag }}</span
          >
        </p>
        <a
          v-if="tag !== 'ugc'"
          :href="clubLink"
          class="flex items-center gap-2 p-1 rounded-sm bg-white w-fit"
        >
          <img
            v-if="!!badgeSrc && badgeSrc !== ''"
            class="w-7 rounded-sm"
            style="aspect-ratio: 16 / 9"
            :src="badgeSrc"
            alt="image"
          />
          <p v-if="!!badgeName && badgeName !== ''" class="text-xs font-bold">
            {{ badgeName }}
          </p>
        </a>
      </div>
      <a
        :href="assetLink"
        target="_blank"
        class="flex items-end block"
        :class="{ 'p-3 rounded': frameHexColor }"
        :style="
          frameHexColor
            ? {
                backgroundColor: frameHexColor,
              }
            : undefined
        "
      >
        <div v-if="tag !== 'ugc'" class="w-full h-full">
          <MediaCard
            class="w-full h-full mx-auto !object-contain object-contain! lg:max-w-xs pointer-events-none overflow-hidden"
            :class="
              frameHexColor
                ? `max-h-[calc(10rem_-1.5rem)] lg:max-h-[calc(12rem-_1.5rem)]`
                : 'max-h-40 lg:max-h-48'
            "
            :src="assetSrc"
            :type="tag as PassportItemAssetType"
            :found="!!assetSrc"
            :video-class="`w-full h-full`"
          />
        </div>
        <div
          v-if="tag === 'ugc'"
          class="media-wrapper p-2 rounded-xl bg-violet-50 h-full w-full flex items-center"
        >
          <MediaEmbed
            class="w-full h-full rounded-xl mx-auto max-h-40 lg:max-h-48 lg:max-w-xs pointer-events-none overflow-hidden"
            :found="!!assetSrc"
            :src="assetSrc"
            :type="tag"
            :autoplay="false"
          />
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.instagram-media {
  min-width: auto !important;
}

// .twitter-tweet {
//   margin-top: 0 !important;
//   margin-bottom: 0 !important;
// }

// #twitter-widget-0 {
//   width: 100% !important;
// }
</style>

<style scoped lang="scss">
.media-wrapper {
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
