<script lang="ts">
  import type { Collection} from '@plugins/collections'
  export let collections: Collection[] = []
  export let base: string = '/admin/collections'
</script>

{#if collections.length > 0}
  {#each collections as collection}
  <a href={`${base}/${collection.id}`}>
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
        {collection.name}
      </p>
      <div
        class={`flex flex-col items-start gap-2.5 rounded px-2.5  
        ${
          collection.isTimeLimitedCollection ? 'bg-[#6D9BFF]' : 'bg-[#FFC751]'
        }`}
      >
        <p class="text-center text-lg font-medium text-black">
          {collection.isTimeLimitedCollection
            ? 'Time Limited'
            : 'Limited Amount'}
        </p>
      </div>
      <p class="text-ellipsis text-base font-normal text-black">
        {collection.description}
      </p>
      <div class="flex items-start gap-2.5 overflow-hidden">
        {#if collection.memberships.length > 0}
          {#each collection.memberships as membership, i}
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
  </a>
  {/each}
{/if}
