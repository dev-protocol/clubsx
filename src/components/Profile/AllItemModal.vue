<script setup lang="ts">
import UserAssets from '@pages/passport/components/UserAssets.vue'
</script>

<template>
  <div class="w-full max-w-2xl m-auto p-2 rounded-md bg-white">
    <UserAssets v-bind="$attrs as unknown as any" />
  </div>
</template>
