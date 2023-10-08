<script setup lang="ts">
const { isHighlighted } = defineProps<{
  isHighlighted: Boolean
}>()
</script>

<template>
  <div
    class="ml-4 mr-7 h-0 flex-1 border-[1px]"
    v-bind:class="isHighlighted ? 'border-white' : 'border-[#3A4158]'"
  ></div>
</template>
