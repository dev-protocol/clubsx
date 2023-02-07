<script lang="ts">
import { defineComponent } from 'vue'
import { setOptions } from '@devprotocol/clubs-core'

export default defineComponent({
  props: {
    deworkUrl: {
      type: String,
      required: true,
    },
    currentPluginIndex: {
      type: Number,
      required: true,
    },
  },
  methods: {
    updateOptions(event: Event) {
      setOptions(
        [
          {
            key: 'deworkUrl',
            value: (event.target as HTMLInputElement)?.value || this.deworkUrl,
          },
        ],
        this.currentPluginIndex
      )
    },
  },
})
</script>

<template>
  <form>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="dework-url">Dework URL</label>
      <input
        :value="deworkUrl"
        @input="updateOptions"
        class="rounded bg-[#040B10] px-8 py-4"
        id="dework-url"
        name="dework-url"
      />
    </div>
  </form>
</template>
