<script lang="ts">
  import type { Membership } from '@plugins/memberships'
  export let memberships: Membership[]
</script>

<div
  class="flex max-w-4xl flex-col items-start gap-4 rounded-2xl rounded-2xl bg-white"
>
  <div class="flex items-start gap-2.5">
    <img
      class="rounded-t-2xl"
      src="https://i.ibb.co/RbxFzn8/img.jpg"
      alt="collection card banner"
    />
  </div>
  <div class="flex flex-col items-start gap-4 p-4">
    <p class="text-center text-3xl font-normal text-black">
      Foo this is a collection
    </p>
    <div class="flex flex-col items-start gap-2.5 rounded bg-[#6D9BFF] px-2.5">
      <p class="text-center text-lg font-medium text-black">Time Limited</p>
    </div>
    <p class="text-ellipsis text-base font-normal text-black">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>
    <div class="overflow-hidden flex items-start gap-2.5">
      {#if memberships.length > 0}
      {#each memberships as membership, i}
      <img
      class="h-16 w-16 rounded-md"
      src={membership.imageSrc}
      alt={`membership-image ${i}`}
    />
      {/each}
      {/if}
    </div>
  </div>
</div>
