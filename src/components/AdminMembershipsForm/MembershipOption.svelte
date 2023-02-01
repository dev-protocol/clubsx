<script lang="ts">
  export let name: string
  export let imagePath: string
  export let ethPrice: string
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

  <span class="font-semibold">{ethPrice} ETH</span>

  <span class="text-sm">{description}</span>
</div>
