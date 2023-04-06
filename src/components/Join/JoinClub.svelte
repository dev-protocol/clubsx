<script lang="ts">
  import ETH from '@assets/ETH.svg'
  import DEV from '@assets/devtoken.png'
  import { providers } from 'ethers'
  import { composeTiers } from '@fixtures/utility'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import { onMount } from 'svelte'
  import type { Membership } from '@plugins/memberships'
  import Skeleton from '@components/Global/Skeleton.svelte'

  export let propertyAddress: string
  export let memberships: Membership[]
  export let tenantName: string
  export let rpcUrl: string

  let currency: 'eth' | 'dev' = 'eth'
  let composedTiers: { dev: Membership[]; eth: Membership[] } = {
    dev: [] as Membership[],
    eth: [] as Membership[],
  }

  onMount(async () => {
    composedTiers = await composeTiers({
      sourceTiers: memberships,
      provider: new providers.JsonRpcProvider(rpcUrl),
      tokenAddress: propertyAddress ?? '',
    })
    console.log({ composedTiers })
  })

  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as 'dev' | 'eth'
  }

  const hasNotFee = (tier: Membership) =>
    tier.fee === undefined || tier.fee.percentage === 0
</script>

<section class="flex flex-col rounded-xl bg-dp-blue-grey-300 p-4 shadow">
  <h2 class="mb-4 text-4xl font-bold">Join</h2>
  <!-- DAOName from YAML config -->
  <div class="mb-8">Join {tenantName} in support of the project.</div>

  <h3 class="mb-4 text-2xl font-bold">Purchase with</h3>
  <form class={`mb-8 grid gap-2 md:grid-cols-2`}>
    <label
      class={`flex items-center gap-2 rounded border p-8 py-4 ${
        currency === 'dev' ? 'border-native-blue-400' : 'border-white/20'
      }`}
    >
      <input
        class=""
        type="radio"
        name="input"
        value="dev"
        on:change={switchInputs}
        checked={currency === 'dev'}
      />
      <img src={DEV} alt="DEV" class="h-8 w-8" />
      <span class="font-bold">DEV</span>
    </label>
    <label
      class={`flex items-center gap-2 rounded border p-8 py-4 ${
        currency === 'eth' ? 'border-native-blue-400' : 'border-white/20'
      }`}
    >
      <input
        class=""
        type="radio"
        name="input"
        value="eth"
        on:change={switchInputs}
        checked={currency === 'eth'}
      />
      <img src={ETH} alt="ETH" class="h-8 w-8" />
      <span class="font-bold">ETH</span>
    </label>
  </form>

  <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
  <div class="mb-8 grid gap-8 lg:grid-cols-2">
    {#each composedTiers[currency] as tier, i}
      {#if tier.imageSrc}
        <div id={`select-opt-${i}-${currency}`}>
          <MembershipOption
            name={tier.name}
            clubName={tenantName}
            imagePath={tier.imageSrc}
            id={`${tier.id}:${currency}`}
            description={tier.description}
            ethPrice={tier.currency === 'ETH' ? String(tier.price) : undefined}
            devPrice={tier.currency === 'DEV' && hasNotFee(tier)
              ? String(tier.price)
              : undefined}
          />
          {#if currency === 'eth' || (currency === 'dev' && hasNotFee(tier))}
            <a
              class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
              href={`/join/${tier.id}?input=${tier.currency}`}>Select</a
            >
          {:else}
            <span
              class="mt-2 block w-full rounded bg-black/30 py-4 text-center text-sm font-semibold text-white"
              >(Unavailable)</span
            >
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</section>
