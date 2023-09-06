<script lang="ts">
  import USDC from '@assets/USDC.svg'
  import ETH from '@assets/ETH.svg'
  import MATIC from '@assets/MATIC.svg'
  import DEV from '@assets/devtoken.png'
  import type { Tiers } from '@constants/tier'
  import { CurrencyOption } from '@constants/currencyOption'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'

  export let tiers: Tiers
  export let tenantName: string
  export let preferedCurrency: 'dev' | 'eth' | 'usdc' | 'matic' = 'usdc'

  let currency: 'dev' | 'eth' | 'usdc' | 'matic' = preferedCurrency
  let currencies = new Set(tiers.map((t) => t.currency))

  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as 'dev' | 'eth'
  }
</script>

<section
  class="flex flex-col rounded-xl bg-dp-white-200 p-4 text-dp-white-ink shadow"
>
  <h2 class="mb-4 text-4xl font-bold">Join</h2>
  <!-- DAOName from YAML config -->
  <div class="mb-8">Join {tenantName} in support of the project.</div>

  <h3 class="mb-4 text-2xl font-bold">Purchase with</h3>
  <form
    class={`mb-8 grid gap-2 ${
      currencies.has(CurrencyOption.DEV) ? 'md:grid-cols-2' : ''
    }`}
  >
    {#if currencies.has(CurrencyOption.USDC)}
      <label
        class={`flex items-center gap-2 rounded border p-8 py-4 ${
          currency === 'usdc' ? 'border-native-blue-400' : 'border-white/20'
        }`}
      >
        <input
          class=""
          type="radio"
          name="input"
          value="usdc"
          on:change={switchInputs}
          checked={preferedCurrency === 'usdc'}
        />
        <img src={USDC} alt="USDC" class="h-8 w-8" />
        <span class="font-bold">USDC</span>
      </label>
    {/if}
    {#if currencies.has(CurrencyOption.DEV)}
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
    {#if currencies.has(CurrencyOption.ETH)}
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
    {/if}
    {#if currencies.has(CurrencyOption.MATIC)}
      <label
        class={`flex items-center gap-2 rounded border p-8 py-4 ${
          currency === 'matic' ? 'border-native-blue-400' : 'border-white/20'
        }`}
      >
        <input
          class=""
          type="radio"
          name="input"
          value="matic"
          on:change={switchInputs}
          checked={preferedCurrency === 'matic'}
        />
        <img src={MATIC} alt="MATIC" class="h-8 w-8" />
        <span class="font-bold">MATIC</span>
      </label>
    {/if}
  </form>

  <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
  <div class="mb-8 grid gap-8 lg:grid-cols-2">
    {#each tiers.filter((t) => t.currency === currency) as tier, i}
      {#if tier.badgeImageSrc}
        <div>
          <MembershipOption
            name={tier.title}
            clubName={tenantName}
            imagePath={tier.badgeImageSrc}
            id={`${tier.id}:${currency}`}
            description={tier.badgeImageDescription}
            price={String(tier.amount)}
            currency={tier.currency}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}-${currency}`}
            href={`/join/${tier.id}`}>Select</a
          >
        </div>
      {/if}
    {/each}
  </div>
</section>
