<script lang="ts">
  import { fly } from 'svelte/transition'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { closeModal } from 'svelte-modals'

  import { Strings } from '../i18n'

  export let isOpen: boolean
  export let onClose: UndefinedOr<() => Promise<void>> = undefined
  export let href: string

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  const onClickClose = async () => {
    onClose && (await onClose())
    closeModal()
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
      class="grid pointer-events-auto mx-auto mb-0 lg:m-auto grid-rows-[1fr_auto] w-full max-w-2xl items-center justify-items-center rounded-t-3xl lg:rounded-b-3xl border-x border-t border-surface-200 bg-white p-6 text-black subpixel-antialiased shadow-xl gap-12"
    >
      <video
        src="/assets/fireworks_8819063.mp4"
        loop
        autoplay
        playsinline
        muted
        class="w-full max-w-80 mx-auto"
      />
      <p class="font-bold text-2xl">{i18n('PassportUpdated')}</p>
      <div class="w-full flex items-center justify-between">
        <button
          on:click|preventDefault={onClickClose}
          class="hs-button is-filled is-large w-fit text-center"
          >{i18n('Close')}</button
        >
        <a {href} class="hs-button is-filled is-large w-fit text-center"
          >{i18n('PreviewMyPassport')}</a
        >
      </div>
    </div>
  </div>
{/if}
