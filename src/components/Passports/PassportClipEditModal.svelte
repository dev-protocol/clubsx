<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import ColorPicker from 'svelte-awesome-color-picker'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { closeModal, closeAllModals } from 'svelte-modals'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'

  export let isOpen: boolean
  export let item: PassportItem
  export let hex: string = '#FFFF00'
  export let description: string = ''
  export let action: UndefinedOr<
    (
      clip: PassportItem,
      description: string,
      frameColorHex: string,
    ) => Promise<boolean>
  > = undefined
  export let closeAllOnFinished: boolean = false
  export let onClose: UndefinedOr<() => Promise<void>> = undefined

  const i18nBase = i18nFactory(Strings)
  let loading = false
  let i18n = i18nBase(['en'])

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const onClickAction = async () => {
    loading = true
    const isSuccess = action && (await action(item, description, hex))
    loading = false

    if (isSuccess) {
      closeAllOnFinished ? closeAllModals() : closeModal()
    }
  }

  const onClickClose = async () => {
    onClose && (await onClose())
    closeModal()
  }
</script>

{#if isOpen}
  <!-- on:introstart and on:outroend are required to transition 1 at a time between modals -->
  <div
    role="dialog"
    class="fixed bottom-0 max-h-screen lg:bottom-1/2 lg:translate-y-1/2 left-1/2 flex flex-col w-full max-w-2xl -translate-x-1/2 items-center justify-center rounded-t-3xl lg:rounded-b-3xl border-x border-t border-surface-200 bg-surface-600 p-12 text-surface-ink subpixel-antialiased shadow-xl lg:pb-32 gap-6"
    transition:fly={{ y: 500 }}
    on:introstart
    on:outroend
    on:close={onClickClose}
  >
    <div class="w-full flex items-center justify-between">
      <button on:click|preventDefault={onClickClose} class="w-6 h-6">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 18L18 6M6 6L18 18"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <p class="font-DMSan font-bold text-base">{i18n('EditItem')}</p>

      <button
        on:click|preventDefault={() => onClickAction()}
        class="hs-button is-filled is-large w-fit text-center">Done</button
      >
    </div>

    <div class="grid gap-8 w-full max-w-screen-sm overflow-y-scroll">
      <img
        src={item.itemAssetValue}
        alt="Passport item"
        class="w-full h-auto max-w-44 max-h-44 rounded-md"
      />

      <label class="hs-form-field is-filled">
        <span class="hs-form-field__label"> {i18n('Description')} </span>
        <textarea
          class="hs-form-field__input"
          bind:value={description}
          id="passport-item-description"
          name="passort-item-description"
          placeholder={i18n('DescriptionPlaceholder')}
        />
        <span class="hs-form-field__helper">
          * {i18n('MarkdownAvailable')}
          <a
            href="https://www.markdownguide.org/basic-syntax"
            target="_blank"
            class="underline [font-size:inherit]"
            rel="noopener noreferrer">({i18n('WhatIsMarkdown')} ↗)</a
          >
        </span>
      </label>

      <span class="hs-form-field is-filled">
        <span class="hs-form-field__label"> {i18n('FrameColor')} </span>
        <ColorPicker
          bind:hex
          position="responsive"
          sliderDirection="vertical"
          isTextInput={true}
          isAlpha={false}
          label="Click here to choose a color"
          --cp-text-color="#000"
        />
      </span>
    </div>
  </div>
{/if}
