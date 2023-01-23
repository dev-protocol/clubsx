<script lang="ts">
  import { onFinishConfig } from '@devprotocol/clubs-core/events'
  import { onMount } from 'svelte'

  export let next: string
  let show = false

  onMount(() => {
    onFinishConfig((data) => {
      if (data.detail.success) {
        show = true
      }
    })
  })
</script>

{#if show}
  <a class="hs-button is-filled is-large rounded" href={next}> Next </a>
{/if}
