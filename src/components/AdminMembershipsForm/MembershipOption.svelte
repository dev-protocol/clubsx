<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'

  export let name: string
  export let imagePath: string
  export let ethPrice: UndefinedOr<string> = undefined
  export let devPrice: UndefinedOr<string> = undefined
  export let description: string
  export let className: string = ''
</script>

<div
  class={`flex flex-col gap-3 rounded bg-white p-2.5 text-black ${className}`}
>
  <span class="font-semibold">{name}</span>

  <img
    class="aspect-square w-full"
    src={imagePath}
    alt={`${name} Membership`}
  />

  {#if ethPrice}
    <span class="font-semibold">{ethPrice} ETH</span>
  {/if}
  {#if devPrice}
    <span class="font-semibold">{devPrice} DEV</span>
  {/if}

  <span class="text-sm">{description}</span>
</div>
