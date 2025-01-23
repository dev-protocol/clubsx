<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'
import Modal from '@pages/passport/components/Modal.vue'

import { Strings } from '../i18n'
import type { PassportClip } from '../types'
import PassportClipCard from './PassportClip.vue'
import { passportSpotlightClass } from '@fixtures/ui/passport'
import PassportClipModal from './PassportClipModal.vue'
import { mediaSource } from '@devprotocol/clubs-plugin-passports/media'

const props = defineProps<{
  id: string
  clips: PassportClip[]
  skinSection: 'spotlight' | 'clips'
  skinId: string
}>()

const i18nBase = i18nFactory(Strings)
const i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

const modalVisible = ref(false)
const modalItemIndex = ref<number>()
const modalItem = ref<PassportClip>()
const colItems = computed(() => {
  return props.skinSection === 'clips'
    ? [
        props.clips.filter((_, index) => {
          const i = index + 1
          return i === 1 || (i !== 3 && (i - 1) % 3 === 0)
        }),
        props.clips.filter((_, index) => {
          const i = index + 1
          return i === 2 || (i - 2) % 3 === 0
        }),
        props.clips.filter((_, index) => {
          const i = index + 1
          return i % 3 === 0
        }),
      ]
    : undefined
})
const handleOnClick = (item: PassportClip, index: number) => {
  modalItem.value = item
  modalVisible.value = true
  modalItemIndex.value = index
}

const modalClose = () => {
  modalItemIndex.value = -1
  modalVisible.value = false
  modalItem.value = {} as PassportClip
}

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)
})
</script>

<template>
  <section class="grid gap-8">
    <ul
      :class="[
        {
          [passportSpotlightClass(clips.length).container]:
            skinSection === 'spotlight',
        },
        {
          ['grid gap-1 lg:gap-4 grid-cols-3 content-stretch']:
            skinSection === 'clips',
        },
      ]"
    >
      <li
        v-if="skinSection === 'spotlight' && clips?.length"
        v-for="(clip, index) in clips"
        :key="index"
        :class="[
          {
            [passportSpotlightClass(clips.length).child[index]]:
              skinSection === 'spotlight',
          },
        ]"
      >
        <PassportClipCard
          :item="clip"
          :index="index"
          :truncate="true"
          :skinSection="skinSection"
          :skinId="skinId"
          media-embed-class="!aspect-[1/1.391]"
          class="cursor-pointer"
          @click="
            () => {
              handleOnClick(clip, index)
            }
          "
        />
      </li>
      <li
        v-if="skinSection === 'clips' && colItems"
        v-for="items in colItems"
        class="flex flex-col gap-4"
      >
        <PassportClipCard
          v-for="(clip, cindex) in items"
          :item="clip"
          :index="cindex"
          :truncate="true"
          :skinSection="skinSection"
          :skinId="skinId"
          :media-embed-class="
            mediaSource(clip.link) !== 'youtube' ? '!aspect-[1/1.391]' : ''
          "
          class="cursor-pointer"
          @click="
            () => {
              handleOnClick(clip, cindex)
            }
          "
        />
      </li>
    </ul>
  </section>

  <Modal
    v-if="modalVisible"
    :is-visible="modalVisible"
    :handle-modal-close="modalClose"
    :modal-content="PassportClipModal"
    :attrs="{
      item: modalItem,
      index: modalItemIndex,
      skinSection: props.skinSection,
      truncate: false,
      skinId: props.skinId,
      classes: 'max-w-screen-md',
      share: true,
      clubsLink: true,
    }"
  />
</template>
