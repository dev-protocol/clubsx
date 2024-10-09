<script setup lang="ts">
import Image01 from '../../../assets/sample/image01.png'
import Image02 from '../../../assets/sample/image02.png'
import Image03 from '../../../assets/sample/image03.png'
import SkinsModal from '@pages/passport/components/SkinsModal.vue'
import Modal from '@pages/passport/components/Modal.vue'
import { onMounted, ref } from 'vue'

// for modal
const modalVisible = ref(false)
const modalTitle = ref('')
const modalDescription = ref('')
const modalImage = ref('')

const handleOnClick = (item : {
  title: string
  description: string
  image: string
}) => {
  modalVisible.value = true
  modalTitle.value = item.title
  modalDescription.value = item.description
  modalImage.value = item.image
}

const modalClose = () => {
  modalVisible.value = false
}

const items = ref<
  {
    key: number
    image: string
    title: string
    description: string
  }[]
  | []>([])

const getItems = (nextGroupKey: number, count: number) => {
  const nextItems = [];

  for (let i = 0; i < count; ++i) {
    const nextKey = nextGroupKey * count + i;

    // ランダムな長さのタイトルを作成する
    const titleLength = Math.floor(Math.random() * 100) + 1;
    const title = Array.from({ length: titleLength }, () => 'foo is bar.').join('');

    // ランダムな長さのdescriptionを作成する
    const descriptionLength = Math.floor(Math.random() * 10) + 1;
    const description = Array.from({ length: descriptionLength }, () => 'bar').join('');

    nextItems.push({
      key: nextKey,
      image: nextKey % 3 === 0 ? Image01.src : nextKey % 3 === 1 ? Image02.src : Image03.src,
      title: `PV - ${title}`,
      description: description,
    });
  }
  return nextItems;
}

onMounted(async () => {
  items.value = getItems(0, 3)
})

</script>

<template>
  <div class="items items-end"
  :class="[items.length === 3 ? 'justify-between gap-4' : 'justify-start gap-4']"
  >
    <div
      v-for="item in items"
      :key="item.key"
      class="p-1 border border-gray-200 rounded shadow-lg"
      :class="[
        items.length < 3 || items.length === 3 && item.key === 0 ? 'w-96' : 'w-72',
        items.length < 3 ? 'below-three-item' : 'above-three-item',
        ]"
      @click="() => {
        handleOnClick({
          title: 'Mystic Horizon',
          description: 'Mystic Horizon',
          image: Image01.src,
        })
      }"
    >
      <div>
        <img class="w-full" :src="item.image" alt="" />
      </div>
      <div class="text-sm text-left break-words">
        <div class="item-title font-bold">{{ item.title }}</div>
        <div class="text-gray-400">{{ item.description }}</div>
      </div>
    </div>
  </div>
  <Modal
    :is-visible="modalVisible"
    :modal-content="SkinsModal"
    :handle-modal-close="modalClose"
    :attrs="{
      title: modalTitle,
      description: modalDescription,
      imageSrc: modalImage,
    }" />
</template>

<style scoped lang="scss">
.items {
  display: grid;
  grid-template: repeat(1, auto) / repeat(3, auto);
}

.above-three-item:nth-child(1) {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.above-three-item:nth-child(2) {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.above-three-item:nth-child(3) {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
}

.below-three-item:nth-child(1) {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.below-three-item:nth-child(2) {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.item-title {
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
</style>
