<script lang="ts">
  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import { buildConfig } from '@devprotocol/clubs-core'
  import { onMount } from 'svelte'
  import type { GatedMessage } from '../types'

  export let currentPluginIndex: number
  export let forms: GatedMessage[] = []
  export let id: string
  let removing = false

  const remove = () => {
    removing = true
    setOptions(
      [{ key: 'forms', value: forms.filter((f) => f.id !== id) }],
      currentPluginIndex,
    )
    setTimeout(buildConfig, 50)
  }

  onMount(() => {
    document.body.addEventListener(
      ClubsEvents.FinishConfiguration,
      (ev: any) => {
        if (typeof ev.detail.success === 'boolean') {
          if (ev.detail.success) {
            removing = false
          } else {
            // TODO: Add an error handling
          }
        }
      },
    )
  })
</script>

<div class="flex w-full justify-end">
  <button
    on:click|preventDefault={() => remove()}
    class={`hs-button is-large is-filled is-error is-fullwidth ${
      removing ? 'animate-pulse bg-gray-500/60' : ''
    }`}
    disabled={removing}>Remove</button
  >
</div>
