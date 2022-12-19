<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { MembershipOption } from './types'
  import membershipOpt1 from '@assets/membership-opt-1.png'
  import membershipOpt2 from '@assets/membership-opt-2.png'
  import membershipOpt3 from '@assets/membership-opt-3.png'

  export let currentPluginIndex: number

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }

  const membershipOptions: MembershipOption[] = [
    {
      name: 'Casual',
      imagePath: membershipOpt1,
      ethPrice: '0.003',
      description: 'lorem ipsum',
    },
    {
      name: 'Luxury',
      imagePath: membershipOpt2,
      ethPrice: '1',
      description: 'lorem ipsum',
    },
    {
      name: 'Edge',
      imagePath: membershipOpt3,
      ethPrice: '0.5',
      description: 'lorem ipsum',
    },
  ]

  /**
   * Indicates the index of the selected option from above membershipOptions
   */
  let selectedMembershipOptionIndex: number
</script>

<div class="grid grid-cols-3 gap-4">
  {#each membershipOptions as opt, i}
    <div>
      <MembershipOptionCard
        name={opt.name}
        imagePath={opt.imagePath}
        ethPrice={opt.ethPrice}
        description={opt.description}
      />
      <button
        class="mt-2 w-full rounded bg-black py-4 text-sm font-semibold text-white"
        on:click={(_) => (selectedMembershipOptionIndex = i)}>Select</button
      >
    </div>
  {/each}
</div>
