<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'

import { Strings } from '../i18n'
import type { PassportClip } from '../types'
import PassportClipCard from './PassportClip.vue'
import Modal from '@pages/passport/components/Modal.vue'

const props = defineProps<{
  clips: PassportClip[]
  id: string
}>()

const i18nBase = i18nFactory(Strings)

const i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))
const modalVisible = ref(false)
const modalItem = ref<PassportClip>()
const modalItemIndex = ref<number>()

const handleOnClick = (item: PassportClip, index: number) => {
  modalVisible.value = true
  modalItem.value = item
  modalItemIndex.value = index
}

const modalClose = () => {
  modalVisible.value = false
  modalItem.value = {} as PassportClip
  modalItemIndex.value = -1
}

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)
})
</script>

<template>
  <section class="grid gap-8">
    <ul
      class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] content-stretch"
    >
      <li
        v-if="clips?.length"
        v-for="(clip, index) in clips"
        :key="index"
        class="empty:hidden"
      >
        <PassportClipCard
          :item="clip"
          :truncate="true"
          :index="index"
          class="h-full"
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
    :is-visible="modalVisible"
    :modal-content="PassportClipCard"
    :handle-modal-close="modalClose"
    :attrs="{
      item: modalItem,
      index: modalItemIndex,
      truncate: false,
      classes: 'max-w-screen-md',
    }"
  />
</template>
