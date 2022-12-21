<script lang="ts">
  export let name: string
  export let imagePath: string
  export let ethPrice: string
  export let description: string
</script>

<div class="flex flex-col rounded bg-white px-2 py-1 text-black">
  <span class="mb-2 font-semibold">{name}</span>

  <div class="mb-2">
    <img class="w-full" src={imagePath} alt={`${name} Membership`} />
  </div>

  <!-- TODO: how is this different than description? -->
  <span class="mb-2 text-sm">Foo</span>

  <span class="mb-2 font-semibold">{ethPrice} ETH</span>

  <span class="text-sm">{description}</span>
</div>
