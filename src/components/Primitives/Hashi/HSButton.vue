<template>
  <button
    v-if="!link"
    v-bind:class="`hs-button${type && ' ' + assertType(type)}`"
    role="button"
  >
    <i v-if="isIconVisible" class="hs-button__icon"
      ><slot name="icon"></slot
    ></i>
    <span v-if="isLabelVisible" class="hs-button__label"><slot></slot></span>
  </button>

  <a
    v-else
    v-bind:class="`hs-button${type && ' ' + assertType(type)}`"
    role="link"
    v-bind:href="link"
  >
    <i v-if="isIconVisible" class="hs-button__icon"
      ><slot name="icon"></slot
    ></i>
    <span v-if="isLabelVisible" class="hs-button__label"><slot></slot></span>
  </a>
</template>

<script>
import { Comment } from 'vue'
export default {
  name: 'HSButton',
  props: {
    link: {
      type: String,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
  },
  computed: {
    isLabelVisible() {
      return (
        this.$slots.default &&
        this.$slots.default().findIndex((o) => o.type !== Comment) !== -1
      )
    },
    isIconVisible() {
      return (
        this.$slots.icon &&
        this.$slots.icon().findIndex((o) => o.type !== Comment) !== -1
      )
    },
  },
  methods: {
    assertType(type) {
      const finalTypes = []
      type.split(' ').forEach((type) => {
        finalTypes.push('is-' + type)
      })
      return finalTypes.join(' ')
    },
  },
}
</script>

<style lang="scss" scoped>
.hs-button {
  --hs-button-width: auto;
  flex-flow: row nowrap;
}
</style>
