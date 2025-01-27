<script setup lang="ts">
import MediaCard from '@pages/passport/components/MediaCard.vue'
import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/vue'
import type { PassportItemAssetType } from '@devprotocol/clubs-plugin-passports/types'
import type { FeedType } from '@fixtures/api/feed'
import { computed } from 'vue'
import { itemToHash } from '@fixtures/router/passportItem'

const props = defineProps<FeedType>()

const assetLink = computed(
  () =>
    `/passport/${props.address}/${props.parentPassport.id}/${itemToHash(props.clipType, props.item.id)}`,
)
</script>

<template>
  <div class="grid gap-2 p-2 border-b boder-black/20">
    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-[auto_1fr] items-center gap-3">
        <a :href="`/passport/${address}`">
          <img
            class="w-14 h-14 rounded-full object-cover aspect-square bg-lightgray bg-cover bg-center bg-no-repeat _p-avatar"
            :src="avatarSrc"
            alt="avatar"
          />
        </a>
        <div
          :class="{
            'grid grid-flow-col items-center justify-start gap-1': true,
            'grid-rows-2': tag !== 'ugc',
          }"
        >
          <span class="grid grid-flow-col items-center justify-start gap-2">
            <span class="text-xs font-bold truncate">
              {{ name }}
            </span>
            <span class="text-xs" v-if="props.parentPassport.description"
              >·</span
            >
            <span class="text-xs truncate">
              {{ props.parentPassport.description?.replace(/\\n/g, ' ') }}
            </span>
          </span>
          <div
            v-if="tag !== 'ugc'"
            class="flex items-center gap-2 p-1 rounded-sm bg-white"
            style="width: fit-content"
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
          </div>
        </div>
      </div>

      <div
        v-if="description"
        class="text-xl font-bold text-ellipsis overflow-hidden line-clamp-2"
      >
        {{ description }}
      </div>
      <ul v-if="props.item.tags" class="flex flex-wrap gap-2">
        <li v-for="tag in props.item.tags" class="text-violet-500 text-sm">
          #{{ tag }}
        </li>
      </ul>
    </div>

    <a :href="assetLink" target="_blank">
      <div
        v-if="tag !== 'ugc'"
        class="p-3"
        :style="{
          backgroundColor: frameHexColor,
        }"
      >
        <MediaCard
          class="w-full rounded aspect-square overflow-hidden"
          :src="assetSrc"
          :type="tag as PassportItemAssetType"
          :found="!!assetSrc"
        />
      </div>
      <div v-if="tag === 'ugc'" class="rounded-xl bg-violet-50 p-2">
        <MediaEmbed
          class="w-full rounded-xl aspect-[3/2] mx-auto max-w-xs pointer-events-none"
          :found="!!assetSrc"
          :src="assetSrc"
          :type="tag"
          :autoplay="false"
        />
      </div>
    </a>
  </div>
</template>

<style scoped lang="scss"></style>
