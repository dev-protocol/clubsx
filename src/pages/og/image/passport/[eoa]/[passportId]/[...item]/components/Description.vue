<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import textFit from 'textfit'
import { passportClass } from '@fixtures/ui/passport'
import { ProseTextInherit } from '@devprotocol/clubs-core'

const props = defineProps<{ text: string; html?: boolean; class?: string }>()

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
    :class="passportClass('description')"
  >
    {{ props.text }}
  </div>
  <div
    v-if="props.html"
    v-html="props.text"
    class="wrapper text-center grid content-center items-center"
    :class="{
      [passportClass('description')]: true,
      [ProseTextInherit]: true,
      [props.class ?? '']: props.class,
    }"
  ></div>
</template>

<style>
.wrapper > * {
  font-weight: bold;
}
._p-description p {
  font-size: inherit;
}
</style>
