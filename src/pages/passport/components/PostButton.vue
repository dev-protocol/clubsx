<script setup lang="ts">
import { i18nFactory } from '@devprotocol/clubs-core'
import { Strings } from '../i18n'
import { onMounted, ref } from 'vue'
import { connection } from '@devprotocol/clubs-core/connection'

const props = defineProps<{
  eoa?: string
  skinId?: string
  mode?: 'post' | 'edit'
}>()

const i18nBase = i18nFactory(Strings)
const i18n = ref(i18nBase(navigator.languages))
const account = ref<string>()

onMounted(() => {
  connection().account.subscribe((acc) => {
    account.value = acc
  })
})

const click = () => {
  document.dispatchEvent(
    new CustomEvent('triggered:open-showcase-edit-modal:from-header'),
  )
}
</script>

<template>
  <template v-if="props.eoa === account">
    <button
      v-if="props.mode === 'post'"
      @click="click"
      class="hs-button is-filled is-large !rounded-full"
    >
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

    <a
      v-if="props.mode === 'edit'"
      :href="`/passport/${eoa}/edit${props.skinId ? `?skinId=${props.skinId}` : ''}`"
      class="hs-button is-filled is-large !rounded-full"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="size-5"
      >
        <path
          d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
        />
        <path
          d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
        />
      </svg>

      <span class="font-bold">
        {{ i18n('Edit') }}
      </span>
    </a>
  </template>
</template>
