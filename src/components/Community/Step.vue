<template>
  <div class="relative overflow-hidden rounded-2xl">
    <div
      class="step__overlay absolute flex h-full w-full flex-col justify-center px-6"
    >
      <p class="mb-4">{{ step }}/</p>
      <h3 :class="`font-title text-xl font-bold${hasAction ? ' mb-6' : ''}`">
        {{ label }}
      </h3>
      <slot></slot>
    </div>
    <img class="h-full w-full" :src="media" :alt="alt" />
  </div>
</template>

<script>
import { Comment } from 'vue'

export default {
  name: 'Step',
  props: ['step', 'label', 'media', 'alt'],
  computed: {
    hasAction() {
      return (
        this.$slots.default &&
        this.$slots.default().findIndex((o) => o.type !== Comment) !== -1
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.step__overlay {
  background: linear-gradient(90deg, #000 10%, rgba(0 0 0 / 0) 100%);
}
</style>
