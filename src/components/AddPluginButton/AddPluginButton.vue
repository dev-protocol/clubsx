<template>
  <button
    class="m-0 w-full max-w-full whitespace-normal text-center text-base font-bold leading-normal text-white"
    :disabled="isAdded"
  >
    Add to your {{ clubName }}
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { PluginMeta } from '@constants/plugins'

export default defineComponent({
  name: 'AddPluginButton',
  props: {
    clubName: {
      type: String,
      default: 'Club',
    },
    plugin: {
      type: Object as PropType<PluginMeta>,
      default: {},
    },
  },
  computed: {
    isAdded(): boolean {
      return this.plugin.added
    },
  },
})
</script>
