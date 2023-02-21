<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { Membership } from '@plugins/memberships'

  export let currentPluginIndex: number
  export let memberships: Membership[]
  export let presets: Membership[]
  export let base: string = '/admin'
  export let clubName: string | undefined = undefined

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }

  const presetExplanations = [
    {
      title: 'Community',
      desc: 'Influencers, YouTubers, photographers, musicians, and fans.',
    },
    {
      title: 'Team',
      desc: 'Creative groups of sound, movie, film, software, etc.',
    },
    {
      title: 'DAO',
      desc: 'Blockchains, social, public goods, etc.',
    },
  ]

  const getColStart = (i: number) =>
    i === 0
      ? 'lg:col-start-1'
      : i === 1
      ? 'lg:col-start-2'
      : i === 2
      ? 'lg:col-start-3'
      : i === 3
      ? 'lg:col-start-4'
      : i === 4
      ? 'lg:col-start-5'
      : i === 5
      ? 'lg:col-start-6'
      : i === 6
      ? 'lg:col-start-7'
      : i === 7
      ? 'lg:col-start-8'
      : 'lg:col-start-9'
</script>

<div>
  {#if presets.length > 0}
    <div
      class="mb-16 grid max-w-5xl grid-cols-1 justify-between gap-4 lg:grid-cols-[repeat(3,_minmax(200px,_290px))]"
    >
      {#each presets as opt, i}
        <h3
          class={`mt-8 text-center text-2xl font-bold first:mt-0 lg:row-start-1 lg:mt-0 ${getColStart(
            i
          )}`}
        >
          {presetExplanations[i].title}
        </h3>
        <p class={`text-md lg:row-start-2 ${getColStart(i)}`}>
          {presetExplanations[i].desc}
        </p>
        <MembershipOptionCard
          clubName={clubName ?? 'Your Club'}
          name={opt.name}
          imagePath={opt.imageSrc}
          ethPrice={opt.price.toString()}
          description={opt.description}
          className={`lg:row-start-3 ${getColStart(i)}`}
        />
        <a
          class={`mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white lg:row-start-4 ${getColStart(
            i
          )}`}
          id={`select-opt-${i}`}
          href={`${base}/memberships/new/${opt.id}`}>Select</a
        >
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
            clubName={clubName ?? 'Your Club'}
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
