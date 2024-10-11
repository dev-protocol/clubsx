<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'
import { MasonryInfiniteGrid } from '@egjs/vue3-infinitegrid'
import Modal from '@pages/passport/components/Modal.vue'
import ModalContent from '@pages/passport/components/ModalContent.vue'

import { Strings } from '../i18n'

import Image01 from '../../../assets/sample/image01.png'
import Image02 from '../../../assets/sample/image02.png'
import Image03 from '../../../assets/sample/image03.png'

// for modal
const modalVisible = ref(false)
const modalTitle = ref('')
const modalDescription = ref('')
const modalImage = ref('')

const handleOnClick = (item: any) => {
  modalVisible.value = true
  modalTitle.value = item.title
  modalDescription.value = item.description
  modalImage.value = item.image
}

const modalClose = () => {
  modalVisible.value = false
}

const i18nBase = i18nFactory(Strings)
let i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

const items = ref<
  | {
      key: number
      image: string
      title: string
      description: string
    }[]
  | []
>([])

const getItems = (nextGroupKey: number, count: number) => {
  const nextItems = []

  for (let i = 0; i < count; ++i) {
    const nextKey = nextGroupKey * count + i

    // ランダムな長さのタイトルを作成する
    const titleLength = Math.floor(Math.random() * 30) + 1
    const title = Array.from({ length: titleLength }, () => 'foo is bar.').join(
      '',
    )

    // ランダムな長さのdescriptionを作成する
    const descriptionLength = Math.floor(Math.random() * 10) + 1
    const description = Array.from(
      { length: descriptionLength },
      () => 'bar',
    ).join('')

    nextItems.push({
      key: nextKey,
      image:
        nextKey % 3 === 0
          ? Image01.src
          : nextKey % 3 === 1
            ? Image02.src
            : Image03.src,
      title: `PV - ${title}`,
      description: description,
    })
  }
  return nextItems
}

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)

  items.value = getItems(0, 10)
})
</script>

<template>
  <MasonryInfiniteGrid
    class="container"
    :outline-length="3"
    :gap="{
      horizontal: 5,
      vertical: 20,
    }"
  >
    <div
      class="item flex flex-col gap-2 p-1 border border-gray-200 rounded shadow-lg"
      v-for="item in items"
      :key="item.key"
      @click="
        () => {
          handleOnClick(item)
        }
      "
    >
      <div class="thumbnail">
        <img :src="item.image" alt="" />
      </div>
      <div class="text-sm text-left break-words">
        <div class="item-title font-bold">{{ item.title }}</div>
        <div class="text-gray-400">{{ item.description }}</div>
      </div>
    </div>
  </MasonryInfiniteGrid>
  <Modal
    :is-visible="modalVisible"
    :modal-content="ModalContent"
    :handle-modal-close="modalClose"
    :attrs="{
      title: modalTitle,
      description: modalDescription,
      imageSrc: modalImage,
    }"
  />
</template>

<style scoped>
.container {
  width: 100%;
  margin: 0 auto;
}

.item {
  width: 30%;
}

.item-title {
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}
</style>
