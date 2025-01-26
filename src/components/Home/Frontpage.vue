<script setup lang="ts">
import FeedPageContent from '@components/Feed/FeedPageContent.vue'
import type { FeedType } from '@fixtures/api/feed'

const props = defineProps<{ feeds: FeedType[] }>()
</script>

<template>
  <FeedPageContent :feeds="props.feeds" />
</template>
