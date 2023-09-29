<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { closeModal } from 'svelte-modals'
  import { fly } from 'svelte/transition'

  export let isOpen: boolean
  export let message: string
  export let closeButton: string
  export let action: UndefinedOr<() => Promise<void>> = undefined
  export let actionButton: UndefinedOr<string> = undefined

  let loading = false
  const onClickAction = async () => {
    loading = true
    action && (await action())
    loading = false
    closeModal()
  }
</script>

{#if isOpen}
  <!-- on:introstart and on:outroend are required to transition 1 at a time between modals -->
  <div
    role="dialog"
    class="fixed bottom-0 left-[50%] flex w-full max-w-2xl -translate-x-[50%] items-center justify-center rounded-t-3xl border-x border-t border-dp-blue-grey-300 bg-dp-blue-grey-400 p-12 text-white subpixel-antialiased shadow-xl lg:pb-32"
    transition:fly={{ y: 500 }}
    on:introstart
    on:outroend
  >
    <div class="grid gap-5">
      <p class="text-xl font-bold">{message}</p>
      {#if action && actionButton}
        <button
          on:click={onClickAction}
          disabled={loading}
          class="hs-button is-filled is-fullwidth is-large bg-dp-green-400 text-dp-green-ink disabled:animate-pulse"
          >{actionButton}</button
        >
      {/if}
      <button on:click={closeModal} class="hs-button is-filled is-fullwidth"
        >{closeButton}</button
      >
    </div>
  </div>
{/if}
