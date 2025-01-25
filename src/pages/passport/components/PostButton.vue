<script setup lang="ts">
import { i18nFactory } from '@devprotocol/clubs-core'
import { Strings } from '../i18n'
import { onMounted, ref } from 'vue'

const props = defineProps<{ langs: string[] }>()

const i18nBase = i18nFactory(Strings)
const i18n = ref(i18nBase(props.langs))

onMounted(() => {
  i18n.value = i18nBase(navigator.languages)
})

const click = () => {
  document.dispatchEvent(
    new CustomEvent('triggered:open-showcase-edit-modal:from-header'),
  )
}
</script>

<template>
  <button @click="click" class="hs-button is-filled is-large !rounded-full">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-6"
    >
      <path
        fill-rule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
        clip-rule="evenodd"
      />
    </svg>

    <span class="font-bold">
      {{ i18n('Post') }}
    </span>
  </button>
</template>
