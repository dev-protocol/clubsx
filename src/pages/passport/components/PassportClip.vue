<script lang="ts" setup>
import { always } from 'ramda'
import { computed, onMounted, ref } from 'vue'
import {
  isNotError,
  whenDefined,
  whenNotError,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import { itemToHash } from '@fixtures/router/passportItem'
import { decode, markdownToHtml } from '@devprotocol/clubs-core'

import MediaCard from './MediaCard.vue'
import type { PassportClip } from '../types'
import Skeleton from '@components/Global/Skeleton.vue'
import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/vue'
import { getPassportOgImages } from '@fixtures/url/passports'

const props = defineProps<{
  index: number
  eoa: string
  url: URL
  item: PassportClip
  truncate?: boolean
  skinSection: 'spotlight' | 'clips'
  share?: boolean
  clubsLink?: boolean
  skinId: string
  mediaEmbedClass?: string
  lock?: boolean
  autoplay?: boolean
  onPrev?: () => void
  onNext?: () => void
}>()

const SITE_NAME = computed(
  () =>
    whenDefined(props.item?.clubsUrl, (url) =>
      new URL(url).hostname?.split('.')?.at(0),
    ) ?? 'developers',
)
const API_PATH = computed(() =>
  whenDefined(SITE_NAME.value, (name) => `/api/clubs/?id=${name}`),
)
const IS_LINK = computed(() => typeof props.item.link === 'string')

const elementId = computed<UndefinedOr<string>>(() => {
  const id = whenDefined(props.item.id, (id) =>
    itemToHash(props.skinSection ?? 'clips', id),
  )
  return isNotError(id) ? id : ''
})
const clubConfig = ref<string>()
const preloadOgImages = ref<string[]>(
  ((og) => [og.default])(
    getPassportOgImages({
      url: props.url,
      clip: props.item,
      user: props.eoa,
      skinId: props.skinId,
      itemHash: elementId.value,
    }),
  ),
)

const clubName = computed(() => {
  return whenDefined(clubConfig.value, (config) => decode(config).name)
})

const description = computed(() => {
  return markdownToHtml(props.item.description ?? '')
})

const fetchClub = async (api: string) => {
  return await fetch(api)
    .then((res) => res.json())
    .then(
      (res) =>
        res as
          | null
          | [
              {
                id: string
                propertyAddress: string
                config: { source: string }
              },
            ],
    )
    .catch(always(null))
}

const shareClip = () => {
  const url = new URL(window.location.href)
  const eoa = url.pathname.split('/').at(2) || '' // The expected pathname is /passport/eoa/id/...
  url.pathname = `/passport/${eoa}/${props.skinId || ''}`
  whenNotError(
    itemToHash(props.skinSection || 'clips', props.item.id || ''),
    (hash) => {
      url.searchParams.set('i', hash)
    },
  )
  // Please replace the title and text with the actual values.
  console.log('share:', url.href)
  navigator.share({
    title: 'Check out this clip!',
    text: props.item.description,
    url: url.href,
  })
}

onMounted(async () => {
  preloadOgImages.value.map((img) => {
    const el = document.createElement('img')
    el.src = img
  })
  if (API_PATH.value) {
    const clubApiPri = await fetchClub(`/${API_PATH.value}`)
    const clubApi = clubApiPri ? clubApiPri : await fetchClub(API_PATH.value)
    clubConfig.value = clubApi?.[0]?.config.source ?? undefined
  }
})
</script>

<template>
  <div class="@container/passport-asset">
    <div v-if="!!item" :id="elementId">
      <div
        :class="{
          'bg-surface-200': !item.frameColorHex,
        }"
        :style="{
          backgroundColor: item.frameColorHex,
        }"
        class="shadow-md rounded-md h-fit grid gap-1 content-start w-full overflow-hidden border border-black/20"
      >
        <span class="p-0.5 @[16rem]/passport-asset:p-4">
          <MediaCard
            v-if="item.itemAssetType && item.itemAssetValue"
            :found="!!item"
            :src="item.itemAssetValue"
            :type="item.itemAssetType"
          />
          <MediaEmbed
            v-if="IS_LINK"
            :src="item.link"
            :class="props.mediaEmbedClass"
            :autoplay="props.autoplay"
            :lock="props.lock"
          />
        </span>

        <span class="p-1 @[16rem]/passport-asset:p-4">
          <article
            v-if="description"
            v-html="description"
            class="description text-sm @[16rem]/passport-asset:text-base"
            :class="{ 'line-clamp-1': props.truncate ?? true }"
          ></article>
          <ul class="flex flex-wrap gap-2 empty:hidden">
            <li v-for="tag in props.item.tags" class="text-violet-500 text-sm">
              #{{ tag }}
            </li>
          </ul>
          <div class="flex w-full max-w-full items-center justify-between">
            <i v-if="IS_LINK"></i>
            <span
              v-if="!IS_LINK && clubName && !props.clubsLink"
              class="line-clamp-1 opacity-50 text-sm @[16rem]/passport-asset:text-base"
              >{{ clubName }}</span
            >
            <a
              v-if="!IS_LINK && clubName && props.clubsLink"
              :href="props.item.clubsUrl"
              target="_blank"
              class="line-clamp-1 opacity-50 text-sm @[16rem]/passport-asset:text-base"
              >{{ clubName }}</a
            >

            <div v-if="!IS_LINK && !clubName" class="h-4 w-1/2">
              <Skeleton />
            </div>
          </div>
        </span>
      </div>
      <div
        v-if="props.share"
        class="sticky bottom-0 mt-4 grid gap-4 rounded-xl bg-[rgba(23_0_60/.8)] p-4 backdrop-blur-sm"
      >
        <span class="grid justify-center justify-items-center">
          <button
            @click.stop.prevent="shareClip"
            class="grid justify-center text-white"
          >
            <div
              class="rounded-full bg-[url('https://images.unsplash.com/photo-1694698955114-82c37b89f961?w=320')] bg-cover p-2 shadow-[0_1px_0_0_#fff_inset,0_4px_4px_0_rgba(0_0_0/0.25)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <span>Share</span>
          </button></span
        >
        <span class="flex justify-between rounded-full bg-white/10 px-8 py-4">
          <button
            @click.stop.prevent="props.onPrev"
            class="flex items-center gap-2 text-white"
          >
            <svg
              width="7"
              height="23"
              viewBox="0 0 7 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="Vector 1"
                d="M5 2L2.30714 8.39555C1.47125 10.3808 1.47125 12.6192 2.30714 14.6045L5 21"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
            Prev</button
          ><a href="#" class="flex items-center gap-2 text-white"
            ><span class="size-3 rounded bg-white"></span> Passport</a
          >
          <button
            @click.stop.prevent="props.onNext"
            class="flex items-center gap-2 text-white"
          >
            Next<svg
              class="rotate-180"
              width="7"
              height="23"
              viewBox="0 0 7 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="Vector 1"
                d="M5 2L2.30714 8.39555C1.47125 10.3808 1.47125 12.6192 2.30714 14.6045L5 21"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
article {
  &.overflow-hidden p {
    @apply truncate;
  }
}
.description p {
  font-size: inherit;
}
</style>
