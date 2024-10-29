<script setup lang="ts">
import textFit from 'textfit'
import { ref, onMounted } from 'vue'

const props = defineProps<{ text: string }>()

const wrapper = ref<HTMLFormElement | null>(null)

onMounted(() => {
  if (wrapper.value) {
    textFit(wrapper.value, { multiLine: true })
  }
})
</script>
<template>
  <div ref="wrapper" class="wrapper text-center flex items-center">
    {{ props.text }}
  </div>
</template>

<style>
.wrapper > * {
  font-weight: bold;
}
</style>
