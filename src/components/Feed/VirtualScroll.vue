<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { FeedType } from '@fixtures/api/feed'
import Feed from '@components/Feed/Feed.vue'

// プロパティの型定義
interface Props<T extends FeedType> {
  items: T[];
  itemHeight: number;
  buffer: number;
}

// プロパティの宣言
const props = defineProps<Props<FeedType>>();

// DOM要素の参照
const container = ref<HTMLElement | null>(null);
// スクロール位置の保存
const scrollTop = ref(0);

// 全体の高さを計算
const totalHeight = computed(() => props.items.length * props.itemHeight);

// 可視アイテムの数を計算
const visibleCount = computed(() => {
  if (!container.value) return 0;
  return Math.ceil(container.value.clientHeight / props.itemHeight) + props.buffer;
});

// 可視アイテムの開始インデックスを計算
const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
});

// 可視アイテムの終了インデックスを計算
const endIndex = computed(() => {
  return Math.min(props.items.length, startIndex.value + visibleCount.value);
});

// 可視アイテムを計算
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    ...item,
    offset: (startIndex.value + index) * props.itemHeight,
  }));
});

// スクロールイベントハンドラ
const onScroll = () => {
  if (container.value) {
    scrollTop.value = container.value.scrollTop;
  }
};

// スクロールイベントのスロットリング
let scrollTimeout: number | undefined;
const throttledOnScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = window.setTimeout(onScroll, 16);
};

// マウント時にスクロール位置を初期化
onMounted(() => {
  if (container.value) {
    scrollTop.value = container.value.scrollTop;
  }
});

// スクロール位置やアイテムの変更を監視
watch([scrollTop, () => props.items], () => {
  if (container.value) {
    container.value.scrollTop = scrollTop.value;
  }
});
</script>

<template>
  <div class="virtual-scroll-container" ref="container" @scroll="throttledOnScroll">
    <!-- スクロールスペーサー。全体の高さを設定 -->
    <div class="spacer" :style="{ height: totalHeight + 'px' }"></div>

    <!-- 可視アイテムをレンダリング -->
    <div
      class="item"
      v-for="feed in visibleItems"
      :key="feed.id"
      :style="{ top: `${feed.offset}px` }"
    >
      <Feed :key="feed.id" v-bind="feed" />
    </div>
  </div>
</template>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  height: 600px;
  position: relative;
}
.spacer {
  width: 100%;
}
.item {
  position: absolute;
  width: 100%;
  box-sizing: border-box;
}
</style>
