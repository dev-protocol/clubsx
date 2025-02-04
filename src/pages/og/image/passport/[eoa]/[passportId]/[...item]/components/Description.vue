<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import textFit from 'textfit'
import { passportClass } from '@fixtures/ui/passport'

const {
  text,
  autofit = true,
  class: className,
} = defineProps<{ text: string; autofit?: boolean; class?: string }>()

const wrapper = useTemplateRef('wrapper')

onMounted(() => {
  console.log('xxxx')
  if (autofit && wrapper.value) {
    textFit(wrapper.value, { multiLine: true, minFontSize: 18 })
  }
})
</script>
<template>
  <div
    ref="wrapper"
    class="wrapper text-center flex items-center"
    :class="[
      passportClass('description'),
      { autofit: autofit },
      { [className ?? '']: Boolean(className) },
    ]"
  >
    <span v-if="!autofit">
      {{ text }}
    </span>
    <template v-else>
      {{ text }}
    </template>
  </div>
</template>

<style>
.wrapper > * {
  font-weight: bold;
}
.wrapper:not(.autofit) > * {
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
}
</style>
