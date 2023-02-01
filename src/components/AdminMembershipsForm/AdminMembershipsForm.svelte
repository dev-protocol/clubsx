<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { Membership } from '@plugins/memberships'

  export let currentPluginIndex: number
  export let memberships: Membership[]
  export let presets: Membership[]
  export let base: string = '/admin'

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }
</script>

<div>
  {#if presets.length > 0}
    <div
      class="mb-16 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-4	"
    >
      {#each presets as opt, i}
        <div>
          <MembershipOptionCard
            name={opt.name}
            imagePath={opt.imageSrc}
            ethPrice={opt.price.toString()}
            description={opt.description}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}`}
            href={`${base}/memberships/new/${opt.id}`}>Select</a
          >
        </div>
      {/each}
    </div>
  {/if}
  {#if memberships.length > 0}
    <h2 class="mb-8 text-2xl">Exsiting memberships</h2>
    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-4	"
    >
      {#each memberships as membership, i}
        <div>
          <MembershipOptionCard
            name={membership.name}
            imagePath={membership.imageSrc}
            ethPrice={membership.price.toString()}
            description={membership.description}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}`}
            href={`${base}/memberships/${membership.id}`}>Select</a
          >
        </div>
      {/each}
    </div>
  {/if}
</div>
