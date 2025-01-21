<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import ColorPicker from 'svelte-awesome-color-picker'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { closeModal, closeAllModals } from 'svelte-modals'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'

  import VideoFetch from './VideoFetch.svelte'
  import { isItemPurchased } from '../utils'
  import debounce from 'lodash/debounce'
  import { mediaSource } from '@devprotocol/clubs-plugin-passports/media'
  import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/svelte'

  export let isOpen: boolean
  export let item: PassportItem
  export let hex: string
  export let description: string = ''
  export let action: UndefinedOr<
    (
      clip: PassportItem,
      description: string,
      frameColorHex: string,
      method: 'patch' | 'del',
    ) => Promise<boolean>
  > = undefined
  export let closeAllOnFinished: boolean = false
  export let onClose: UndefinedOr<() => Promise<void>> = undefined
  let imageElement: HTMLImageElement | null = null
  let linkError: UndefinedOr<string>

  const i18nBase = i18nFactory(Strings)
  let loading = false
  let i18n = i18nBase(['en'])

  onMount(async () => {
    if (!isItemPurchased(item)) {
      return
    }
    const { itemAssetType, itemAssetValue } = item || {}
    const isImage = [
      'image',
      'image-link',
      'image-playable',
      'image-playable-link',
    ].includes(itemAssetType ?? '')
    if (isImage && item.itemAssetValue) {
      const response = await fetch(item.itemAssetValue)
      const blob = await response.blob()
      const blobDataUrl = URL.createObjectURL(blob)
      try {
        if (isImage && imageElement) {
          imageElement.src = blobDataUrl
        }
      } catch (error) {
        console.error('Error loading video:', error)
      }
    }
    i18n = i18nBase(navigator.languages)
  })

  const onClickAction = async (method: 'patch' | 'del') => {
    loading = true
    const isSuccess = action && (await action(item, description, hex, method))
    loading = false

    if (isSuccess) {
      closeAllOnFinished ? closeAllModals() : closeModal()
    }
  }

  const onClickClose = async () => {
    onClose && (await onClose())
    closeModal()
  }

  const handleInput = () => {
    const isLinkValid = typeof mediaSource(item.link) === 'string'
    linkError = isLinkValid ? undefined : 'ERROR'
    console.log({ linkError, item })
  }
</script>

{#if isOpen}
  <!-- on:introstart and on:outroend are required to transition 1 at a time between modals -->
  <div
    role="dialog"
    class="fixed pointer-events-none top-0 bottom-0 left-0 right-0 overflow-y-auto flex justify-center items-end lg:items-center lg:py-6 backdrop-blur-md bg-black/30 z-50"
    transition:fly={{ y: 500 }}
    on:introstart
    on:outroend
    on:close={onClickClose}
  >
    <div
      class="flex pointer-events-auto mx-auto mb-0 lg:m-auto flex-col w-full max-w-2xl items-center justify-center rounded-t-3xl lg:rounded-b-3xl border-x border-t border-surface-200 bg-surface-600 p-12 text-surface-ink subpixel-antialiased shadow-xl lg:pb-32 gap-6"
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
          on:click|preventDefault={() => onClickAction('patch')}
          class="hs-button is-filled is-large w-fit text-center">Done</button
        >
      </div>

      <div class="grid gap-8 w-full max-w-screen-sm overflow-y-scroll">
        {#if isItemPurchased(item) && item.itemAssetType !== 'short-video' && item.itemAssetType !== 'short-video-link'}
          <img
            bind:this={imageElement}
            class="max-w-44 max-h-44 rounded-md w-full max-w-full object-cover aspect-square"
            alt="Asset"
          />
        {:else if isItemPurchased(item) && (item.itemAssetType === 'short-video' || item.itemAssetType === 'short-video-link')}
          <VideoFetch
            url={item.itemAssetValue}
            posterUrl={item.itemAssetValue}
            videoClass={`max-w-44 max-h-44 rounded-md w-full object-cover aspect-square`}
            isControlled={item.itemAssetType.includes('short-video')}
          />
        {/if}

        {#if typeof item.link === 'string'}
          <!-- IF IT's A LINK ITEM -->
          <label class="hs-form-field is-filled">
            <span class="hs-form-field__label"> {i18n('ContentLink')} </span>
            <input
              class="hs-form-field__input"
              bind:value={item.link}
              on:keyup={debounce(handleInput, 700)}
              placeholder={i18n('ContentLinkPlaceholder')}
            />
          </label>

          {#if item.link && linkError === undefined}
            <div class="flex justify-center">
              <div class="overflow-hidden rounded">
                <MediaEmbed src={item.link} />
              </div>
            </div>
          {/if}
        {/if}

        <label class="hs-form-field is-filled">
          <span class="hs-form-field__label"> {i18n('Description')} </span>
          <textarea
            class="hs-form-field__input"
            bind:value={description}
            id="passport-item-description"
            name="passort-item-description"
            placeholder={i18n('DescriptionPlaceholder')}
          />
        </label>

        {#if typeof item.link !== 'string'}
          <!-- IF IT's NOT A LINK ITEM -->
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
        {/if}

        <button
          on:click|preventDefault={() => onClickAction('del')}
          class="hs-button is-filled is-error justify-self-end w-fit text-center"
          >Unlist</button
        >
      </div>
    </div>
  </div>
{/if}
