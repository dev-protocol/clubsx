<script lang="ts">
  import EmailConnect from './EmailConnect.svelte'

  let open = false
</script>

<div class="my-8 grid justify-center gap-4">
  {#if open}
    <EmailConnect />
    <button
      class="hs-button is-outlined is-small text-xs rounded-full px-4"
      on:click={() => (open = !open)}>Close</button
    >
  {:else}
    <button
      class="hs-button is-outlined is-small text-xs rounded-full px-4"
      on:click={() => (open = !open)}
      >I'm using Magic Link sign-in with email.</button
    >
  {/if}
</div>
