<script lang="ts">
    import { controlModal } from '@devprotocol/clubs-core/events'
  
    export let ping: boolean = false
  
    const open = () => {
      controlModal({ open: true, closeButton: { label: 'Close' } })
      ping = false
    }
  </script>
  
  <div class="flex w-full justify-end">
    <button
      type="button"
      on:click|preventDefault={() => open()}
      class={`hs-button is-large is-filled relative w-full ${
        ping && 'border-bright-cyan-600 bg-bright-cyan-400'
      }`}
      >Publish
      {#if ping}
        <span class="absolute -left-3 -top-3 flex h-5 w-5">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-bright-cyan-200 opacity-75"
          ></span>
          <span
            class="relative inline-flex h-5 w-5 rounded-full bg-bright-cyan-300"
          ></span>
        </span>
      {/if}
    </button>
  </div>
  