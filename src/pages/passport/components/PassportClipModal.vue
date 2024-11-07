<script setup lang="ts">
import PassportClipCard from './PassportClip.vue'
</script>

<template>
  <div class="w-full max-w-2xl m-auto">
    <PassportClipCard v-bind="$attrs as unknown as any" />
  </div>
</template>
