<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import textFit from 'textfit'

const props = defineProps<{ text: string; html?: boolean }>()

const wrapper = useTemplateRef('wrapper')

onMounted(() => {
  console.log('xxxx')
  if (wrapper.value) {
    textFit(wrapper.value, { multiLine: true, minFontSize: 18 })
  }
})
</script>
<template>
  <div
    v-if="!props.html"
    ref="wrapper"
    class="wrapper text-center flex items-center"
  >
    {{ props.text }}
  </div>
  <div
    v-if="props.html"
    ref="wrapper"
    v-html="props.text"
    class="wrapper text-center grid content-center items-center"
  ></div>
</template>

<style>
.wrapper > * {
  font-weight: bold;
}
</style>
