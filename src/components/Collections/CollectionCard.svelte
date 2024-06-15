<script lang="ts">
  import type { Collection } from '@plugins/collections'
  import { emptyDummyImage } from '@plugins/collections/fixtures'
  import { marked, type Tokens } from 'marked'

  export let collections: Collection[] = []
  export let base: string = '/admin/collections'
  export let view: 'admin' | 'user' = 'admin'

  const space = ' '
  const shortDescription = (str?: string) =>
    marked
      .parse(str ?? '', {
        walkTokens: (token) => {
          if (token.type === 'html') {
            token.type = 'text'
            token.text = space
          }
          if (token.type === 'text') {
            token.text = token.text.replace(/\n/g, space)
          }
          if (token.type === 'space') {
            token.type = 'text' as Tokens.Text['type']
            ;(token as Tokens.Text).text = space
          }
          token.type = 'text'
        },
      })
      .replaceAll('<p>', '')
      .replaceAll('</p>', '')
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
          ${collection.status === 'Draft' ? 'bg-[#C4C4C4]' : ''}`}
              >
                <p class="text-center text-sm font-bold text-black">
                  {collection.status === 'Draft' ? 'Draft' : ''}
                </p>
              </div>
            </div>
            <p class="description text-black/40">
              {shortDescription(collection.description)}
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

<style lang="scss">
  .description {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
</style>
