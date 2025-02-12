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
import type { ClipTypes } from '@fixtures/router/passportItem'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'

const props = defineProps<{
  id: string
  eoa: string
  url: string
  clips: PassportClip[]
  skinSection: 'spotlight' | 'clips'
  skinId: string
  initialSelectedItem?: { type: ClipTypes; id: string }
}>()

const U = undefined
const INIT = whenDefined(props.initialSelectedItem, (it) => {
  const foundIndex =
    it.type === props.skinSection
      ? props.clips.findIndex((clip) => clip.id === it.id)
      : U
  return typeof foundIndex === 'number' && foundIndex > -1 ? foundIndex : U
})

const i18nBase = i18nFactory(Strings)
const i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))
const url = computed(() => new URL(props.url))

const modalVisible = ref<boolean>(typeof INIT === 'number')
const modalItemIndex = ref<UndefinedOr<number>>(INIT)
const modalItem = ref<UndefinedOr<PassportClip>>(
  typeof INIT === 'number' ? props.clips.at(INIT) : U,
)
console.log({ modalItem: modalItem.value, modalVisible: modalVisible.value})
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

const onNext = () => {
  if (modalItemIndex.value !== undefined && modalVisible.value) {
    const newIndex = (modalItemIndex.value + 1) % props.clips.length
    console.log({newIndex})
    modalItemIndex.value = newIndex
    modalItem.value = props.clips[newIndex]
  }
}
const onPrev = () => {
  if (modalItemIndex.value !== undefined && modalVisible.value) {
    const newIndex = (modalItemIndex.value - 1 + props.clips.length) % props.clips.length
    console.log({newIndex})
    modalItemIndex.value = newIndex
    modalItem.value = props.clips[newIndex]
  }
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
          ['grid gap-1 lg:gap-4 grid-cols-2 lg:grid-cols-3 content-stretch items-center gap-y-2 lg:gap-y-8']:
            skinSection === 'clips',
        },
      ]"
    >
      <li
        v-if="clips?.length"
        v-for="(clip, index) in clips"
        :key="index"
        :class="[
          {
            [passportSpotlightClass(clips.length).child[index]]:
              skinSection === 'spotlight',
          },
          {
            ['col-span-2 lg:col-span-1']:
              clip.link &&
              mediaSource(clip.link) === 'x' &&
              skinSection === 'clips',
          },
        ]"
      >
        <PassportClipCard
          :item="clip"
          :index="index"
          :truncate="true"
          :skinSection="skinSection"
          :skinId="skinId"
          :eoa="props.eoa"
          :url="url"
          :lock="true"
          :autoplay="true"
          media-embed-class="rounded overflow-hidden"
          class="cursor-pointer"
          @click="
            () => {
              handleOnClick(clip, index)
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
      autoplay: true,
      eoa: props.eoa,
      lock: false,
      mediaEmbedClass: 'rounded overflow-hidden',
      url,
      onNext: onNext,
      onPrev: onPrev
    }"
  />
</template>
