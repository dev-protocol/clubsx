<script lang="ts" setup>
import { always } from 'ramda'
import { computed, onMounted, ref } from 'vue'
import { isNotError, whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { itemToHash } from '@fixtures/router/passportItem'
import { decode, markdownToHtml } from '@devprotocol/clubs-core'

import MediaCard from './MediaCard.vue'
import type { PassportClip } from '../types'
import Skeleton from '@components/Global/Skeleton.vue'
import Icons from './Icons.vue'

const props = defineProps<{
  index: number
  item: PassportClip
  truncate?: boolean
  skinSection: 'spotlight' | 'clips'
  share?: boolean
  clubsLink?: boolean
}>()

const SITE_NAME =
  new URL(props.item.clubsUrl)?.hostname?.split('.')?.at(0) ?? 'developers'
const API_PATH = `/api/clubs/?id=${SITE_NAME}`

const elementId = computed<UndefinedOr<string>>(() => {
  const id = whenDefined(props.item.sTokenId, (id) =>
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
  url.pathname = `/passport/${eoa}/${itemToHash(props.skinSection || 'clips', props.item.sTokenId || '')}`
  // Please replace the title and text with the actual values.
  navigator.share({
    title: 'Check out this clip!',
    text: props.item.description,
    url: url.href,
  })
}

onMounted(async () => {
  const clubApiPri = await fetchClub(`/${API_PATH}`)
  const clubApi = clubApiPri ? clubApiPri : await fetchClub(API_PATH)
  clubConfig.value = clubApi?.[0].config.source ?? undefined
})
</script>

<template>
  <div class="@container/passport-asset w-full h-full">
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
          :found="!!item"
          :src="item.itemAssetValue"
          :type="item.itemAssetType"
        />
      </span>

      <span class="p-1 @[16rem]/passport-asset:p-4">
        <article
          v-if="description"
          v-html="description"
          class="description text-sm @[16rem]/passport-asset:text-base"
          :class="{ 'line-clamp-1': props.truncate ?? true }"
        ></article>

        <div class="flex w-full max-w-full items-center justify-between">
          <span
            v-if="clubName && !props.clubsLink"
            class="line-clamp-1 opacity-50 text-sm @[16rem]/passport-asset:text-base"
            >{{ clubName }}</span
          >
          <a
            v-if="clubName && props.clubsLink"
            :href="props.item.clubsUrl"
            target="_blank"
            class="line-clamp-1 opacity-50 text-sm @[16rem]/passport-asset:text-base"
            >{{ clubName }}</a
          >

          <div v-if="!clubName" class="h-4 w-1/2">
            <Skeleton />
          </div>
          <button
            v-if="props.share"
            @click.stop.prevent="shareClip"
            class="size-6 rounded-full"
          >
            <Icons icon="share" />
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
