<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { FeedType } from '@fixtures/api/feed'
import Feed from '@components/Feed/Feed.vue'

interface Props<T extends FeedType> {
  items: T[]
  itemHeight: number
  buffer: number
}

const props = defineProps<Props<FeedType>>()

const container = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleCount = computed(() => {
  if (!container.value) return 0
  return Math.ceil(window.innerHeight / props.itemHeight) + props.buffer
})

const startIndex = computed(() => {
  return Math.max(
    0,
    Math.floor(scrollTop.value / props.itemHeight) - props.buffer,
  )
})

const endIndex = computed(() => {
  return Math.min(props.items.length, startIndex.value + visibleCount.value)
})

const visibleItems = computed(() => {
  return props.items
    .slice(startIndex.value, endIndex.value)
    .map((item, index) => ({
      ...item,
      offset: (startIndex.value + index) * props.itemHeight,
    }))
})

const onScroll = () => {
  if (container.value) {
    scrollTop.value = Math.abs(container.value.getBoundingClientRect().top)
  }
}

// スクロールイベントのスロットリング
let scrollTimeout: number | undefined
const throttledOnScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = window.setTimeout(onScroll, 16)
}

onMounted(() => {
  container.value = window.document.body
  if (container.value) {
    scrollTop.value = container.value.scrollTop
  }
  window.document.addEventListener('scroll', throttledOnScroll)
})

watch([scrollTop, () => props.items], () => {
  if (container.value) {
    container.value.scrollTop = scrollTop.value
  }
})
</script>

<template>
  <div class="relative" ref="container">
    <div class="spacer" :style="{ height: totalHeight + 'px' }"></div>

    <div
      class="item"
      v-for="feed in visibleItems"
      :key="feed.id"
      :style="{ top: `${feed.offset}px`, height: `${props.itemHeight}px` }"
    >
      <Feed :key="feed.id" v-bind="feed" />
    </div>
  </div>
</template>

<style scoped>
.spacer {
  width: 100%;
}
.item {
  position: absolute;
  width: 100%;
  box-sizing: border-box;
}
</style>
