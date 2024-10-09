<script setup lang="ts">
const {title, description, imageSrc} = defineProps<{
  title: string | undefined
  description: string | undefined
  imageSrc: string | undefined
}>()
</script>

<template>
  <div
    class="flex flex-col gap-2 p-1 max-w-2xl border border-gray-200 rounded shadow-lg"
  >
    <div class="flex justify-center">
      <img class="" :src="imageSrc" alt="" />
    </div>
    <div class="text-sm text-left break-words">
      <div class="font-bold">{{ title }}</div>
      <div class="text-gray-400">{{ description }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
