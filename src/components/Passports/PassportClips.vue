<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'
import Modal from '@pages/passport/components/Modal.vue'

import { Strings } from '../../pages/passport/i18n'
import type { PassportClip } from '../../pages/passport/types'
import PassportClipCard from './PassportClip.vue'

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
      class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] content-stretch"
    >
      <li
        :key="index"
        class="empty:hidden"
        v-if="clips?.length"
        v-for="(clip, index) in clips"
      >
        <PassportClipCard
          :item="clip"
          :index="index"
          :truncate="true"
          :skinSection="skinSection"
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
    :modal-content="PassportClipCard"
    :attrs="{
      item: modalItem,
      index: modalItemIndex,
      truncate: false,
      classes: 'max-w-screen-md',
    }"
  />
</template>
