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
import Icons from './Icons.vue'
import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/vue'

const props = defineProps<{
  index: number
  item: PassportClip
  truncate?: boolean
  skinSection: 'spotlight' | 'clips'
  share?: boolean
  clubsLink?: boolean
  skinId: string
  mediaEmbedClass?: string
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
  if (API_PATH.value) {
    const clubApiPri = await fetchClub(`/${API_PATH.value}`)
    const clubApi = clubApiPri ? clubApiPri : await fetchClub(API_PATH.value)
    clubConfig.value = clubApi?.[0]?.config.source ?? undefined
  }
})
</script>

<template>
  <div class="@container/passport-asset">
    <div
      v-if="!!item"
      :id="elementId"
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
          <li v-for="tag in props.item.tags" class="text-blue-500 text-sm">
            #{{ tag }}
          </li>
        </ul>
        <div class="flex w-full max-w-full items-center justify-between">
          <i v-if="IS_LINK"></i>
          <span
            v-if="clubName && !props.clubsLink"
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
          <button
            v-if="props.share"
            @click.stop.prevent="shareClip"
            class="grid justify-items-center gap-1"
          >
            <Icons icon="share" class="size-6" />
            <span class="opacity-70 text-sm">Share</span>
          </button>
        </div>
      </span>
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
