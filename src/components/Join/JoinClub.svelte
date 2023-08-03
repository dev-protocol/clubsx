<script lang="ts">
  import ETH from '@assets/ETH.svg'
  import DEV from '@assets/devtoken.png'
  import type { Tiers } from '@constants/tier'
  import { JsonRpcProvider } from 'ethers'
  import { composeTiers } from '@fixtures/utility'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { CurrencyOption } from '@constants/currencyOption'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import { onMount } from 'svelte'

  export let propertyAddress: string
  export let tiers: Tiers
  export let tenantName: string
  export let rpcUrl: string
  export let preferedCurrency: 'dev' | 'eth'

  let currency: typeof preferedCurrency = preferedCurrency
  let composedTiers: { dev: Tiers; eth: Tiers } = {
    dev: preferedCurrency === 'dev' ? [...tiers] : [],
    eth: preferedCurrency === 'eth' ? [...tiers] : [],
  }

  onMount(async () => {
    if (preferedCurrency === 'eth') {
      return
    }
    composedTiers = await composeTiers({
      sourceTiers: tiers,
      provider: new JsonRpcProvider(rpcUrl),
      tokenAddress: propertyAddress ?? '',
    })
  })

  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as 'dev' | 'eth'
  }
</script>

<section class="bg-dp-blue-grey-300 flex flex-col rounded-xl p-4 shadow">
  <h2 class="mb-4 text-4xl font-bold">Join</h2>
  <!-- DAOName from YAML config -->
  <div class="mb-8">Join {tenantName} in support of the project.</div>

  <h3 class="mb-4 text-2xl font-bold">Purchase with</h3>
  <form
    class={`mb-8 grid gap-2 ${
      preferedCurrency === 'dev' ? 'md:grid-cols-2' : ''
    }`}
  >
    {#if preferedCurrency === 'dev'}
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
          checked={preferedCurrency === 'dev'}
        />
        <img src={DEV} alt="DEV" class="h-8 w-8" />
        <span class="font-bold">DEV</span>
      </label>
    {/if}
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
        checked={preferedCurrency === 'eth'}
      />
      <img src={ETH} alt="ETH" class="h-8 w-8" />
      <span class="font-bold">ETH</span>
    </label>
  </form>

  <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
  <div class="mb-8 grid gap-8 lg:grid-cols-2">
    {#each composedTiers[currency] as tier, i}
      {#if tier.badgeImageSrc}
        <div>
          <MembershipOption
            name={tier.title}
            clubName={tenantName}
            imagePath={tier.badgeImageSrc}
            id={`${tier.id}:${currency}`}
            description={tier.badgeImageDescription}
            ethPrice={currency === 'eth' ? String(tier.amount) : undefined}
            devPrice={currency === 'dev' ? String(tier.amount) : undefined}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}-${currency}`}
            href={`/join/${tier.id}${
              currency !== 'dev' ? `?input=${currency}` : ''
            }`}>Select</a
          >
        </div>
      {/if}
    {/each}
  </div>
</section>
