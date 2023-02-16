<script lang="ts">
  import { marked } from 'marked'
  import type { UndefinedOr } from '@devprotocol/util-ts'

  export let name: string
  export let imagePath: string
  export let ethPrice: UndefinedOr<string> = undefined
  export let devPrice: UndefinedOr<string> = undefined
  export let description: string | undefined = undefined
  export let className: string = ''

  const content = marked.parse(description ?? '')
</script>

<div
  class={`flex flex-col gap-3 rounded bg-white p-2.5 text-black ${className}`}
>
  <img
    class="aspect-square w-full	 rounded-2xl bg-black/20 object-contain"
    src={imagePath}
    alt={`${name} Membership`}
  />

  <span class="font-semibold">{name}</span>
  {#if ethPrice}
    <p>
      <span class="text-sm font-semibold">{ethPrice}</span>
      <span class="text-sm">ETH</span>
    </p>
  {/if}
  {#if devPrice}
    <span class="font-semibold">{devPrice} DEV</span>
  {/if}

  {#if description}
    <div class="md grid gap-2 text-sm">{@html content}</div>
  {/if}
</div>

<style lang="scss">
  .md {
    :global(h1) {
      @apply text-3xl font-bold;
    }
    :global(h2) {
      @apply text-2xl font-bold;
    }
    :global(h3) {
      @apply text-xl;
    }
    :global(h4) {
      @apply font-bold;
    }
    :global(h5) {
      @apply font-bold;
    }
    :global(a) {
      @apply inline-block rounded p-1 underline transition hover:bg-white/20;
    }
    :global(ul) {
      @apply list-none;
      :global(li::before) {
        content: '\2022';
        @apply mr-2 text-zinc-300;
      }
    }
    :global(pre) {
      @apply rounded p-3;
    }
  }
</style>
