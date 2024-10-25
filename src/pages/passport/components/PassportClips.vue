<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'

import { Strings } from '../i18n'
import ImageCard from './ImageCard.vue'
import type { PassportClip } from '../types'
import PassportClipCard from './PassportClip.vue'
import Modal from '@pages/passport/components/Modal.vue'

const props = defineProps<{ clips: PassportClip[] }>()

const i18nBase = i18nFactory(Strings)

const i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))
const modalVisible = ref(false)
const modalItem = ref<PassportClip>()

const handleOnClick = (item: PassportClip) => {
  modalVisible.value = true
  modalItem.value = item
}
const modalClose = () => {
  modalVisible.value = false
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
      <li v-if="clips?.length" v-for="clip in clips" class="empty:hidden">
        <PassportClipCard
          :item="clip"
          :truncate="true"
          class="h-full"
          @click="
            () => {
              handleOnClick(clip)
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
      truncate: false,
      classes: 'max-w-screen-md',
    }"
  />
</template>
