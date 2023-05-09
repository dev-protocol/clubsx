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
      <label class="hs-form-field">
        <span class="hs-form-field__label">Dework URL</span>
        <input class="hs-form-field__input" type="text"
               :value="deworkUrl"
               @input="updateOptions"
               id="dework-url"
               name="dework-url"
        />
      </label>
    </div>
  </form>
</template>
