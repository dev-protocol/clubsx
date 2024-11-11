<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'
import Modal from '@pages/passport/components/Modal.vue'

import { Strings } from '../i18n'
import type { PassportClip } from '../types'
import PassportClipCard from './PassportClip.vue'
import { passportSpotlightClass } from '@fixtures/ui/passport'
import PassportClipModal from './PassportClipModal.vue'

const props = defineProps<{
  id: string
  clips: PassportClip[]
  skinSection: 'spotlight' | 'clips'
}>()

const i18nBase = i18nFactory(Strings)
const i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

const modalVisible = ref(false)
const modalItemIndex = ref<number>()
const modalItem = ref<PassportClip>()

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
        v-if="clips?.length"
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
      classes: 'max-w-screen-md',
      share: true,
      clubsLink: true,
    }"
  />
</template>
