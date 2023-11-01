<script lang="ts">
  import type { Collection } from '@plugins/collections'
  import { emptyDummyImage } from '@plugins/collections/fixtures'
  export let collections: Collection[] = []
  export let base: string = '/admin/collections'
  export let view: 'admin' | 'user' = 'admin'
</script>

{#if collections.length > 0}
  {#each collections as collection}
    {#if collection.status === 'Published' || view === 'admin'}
      <a href={`${base}/${collection.id}`} class="group">
        <div
          class="mb-16 grid max-w-4xl items-start gap-4 overflow-hidden rounded-2xl rounded-2xl bg-white shadow transition-shadow group-hover:shadow-xl"
        >
          <div class="flex items-start gap-2.5 overflow-hidden">
            <img
              class="w-full max-w-4xl rounded-t-2xl object-cover transition-transform duration-300 group-hover:scale-110"
              src={collection.imageSrc?.trim().length > 0
                ? collection.imageSrc
                : emptyDummyImage(2400, 1200)}
              alt={`${collection.name}-image`}
            />
          </div>
          <div class="flex flex-col items-start gap-4 p-4">
            <p class="text-center text-3xl font-normal text-black">
              {collection.name}
            </p>
            <div class="flex flex-row gap-4">
              <div
                class={`flex flex-col items-start gap-2.5 rounded px-2.5
          ${
            collection.isTimeLimitedCollection
              ? 'bg-dp-yellow-200'
              : 'bg-native-blue-300'
          }`}
              >
                <p class="text-center text-sm font-bold text-black">
                  {collection.isTimeLimitedCollection
                    ? 'Time Limited'
                    : 'Limited Amount'}
                </p>
              </div>
              <div
                class={`flex flex-col items-start gap-2.5 rounded px-2.5
          ${collection.status === 'Draft' ? 'bg-[#C4C4C4]' : ''}`}
              >
                <p class="text-center text-sm font-bold text-black">
                  {collection.status === 'Draft' ? 'Draft' : ''}
                </p>
              </div>
            </div>
            <p class="text-ellipsis text-base font-normal text-black">
              {collection.description}
            </p>
            <div class="flex items-start gap-2.5 overflow-hidden">
              {#if collection.memberships.length > 0}
                {#each collection.memberships as membership, i}
                  <img
                    class="h-16 w-16 rounded-md"
                    src={membership.imageSrc
                      ? membership.imageSrc
                      : emptyDummyImage(400, 400)}
                    alt={`membership-image ${i}`}
                  />
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </a>
    {/if}
  {/each}
{/if}
