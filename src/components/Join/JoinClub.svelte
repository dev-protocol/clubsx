<script lang="ts">
  import USDC from '@assets/USDC.svg'
  import ETH from '@assets/ETH.svg'
  import MATIC from '@assets/MATIC.svg'
  import DEV from '@assets/devtoken.png'
  import type {
    InjectedTier,
    InjectedTiers,
    Tier,
    Tiers,
  } from '@constants/tier'
  import { CurrencyOption } from '@constants/currencyOption'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'

  const counter = new Map<CurrencyOption, number>()

  export let tiers: Tiers
  export let injectedTiers: UndefinedOr<InjectedTiers>
  export let tenantName: string
  export let preferedCurrency: CurrencyOption = tiers.reduce(
    (prev, current) => {
      const count = counter.get(current.currency) ?? 1
      counter.set(current.currency, count)
      return counter.get(prev.currency) ?? 0 < count ? current : prev
    },
  ).currency

  const currencyList: CurrencyOption[] = Array.from(
    new Set([
      preferedCurrency,
      CurrencyOption.USDC,
      CurrencyOption.MATIC,
      CurrencyOption.ETH,
      CurrencyOption.DEV,
    ]),
  )
  const compositeTiers: (Tier | InjectedTier)[] = [
    ...tiers,
    ...(injectedTiers ?? []),
  ]

  let currency: CurrencyOption = preferedCurrency
  let currencies = new Set(tiers.map((t) => t.currency))

  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as CurrencyOption
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
    on:change={switchInputs}
  >
    {#each currencyList as currencyOption}
      {#if currencies.has(currencyOption)}
        <label
          class={`flex items-center gap-2 rounded border p-8 py-4 ${
            currency === currencyOption
              ? 'border-native-blue-400'
              : 'border-white/20'
          }`}
        >
          <input
            class=""
            type="radio"
            name="input"
            value={currencyOption}
            checked={preferedCurrency === currencyOption}
          />
          <img
            src={currencyOption === 'usdc'
              ? USDC
              : currencyOption === 'matic'
              ? MATIC
              : currencyOption === 'eth'
              ? ETH
              : DEV}
            alt={currencyOption.toUpperCase()}
            class="h-8 w-8"
          />
          <span class="font-bold">{currencyOption.toUpperCase()}</span>
        </label>
      {/if}
    {/each}
    <slot name="currency:option" />
  </form>

  <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
  <div class="mb-8 grid gap-8 lg:grid-cols-2">
    {#each compositeTiers.filter((t) => t.currency === currency) as tier, i}
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
            href={'checkoutUrl' in tier ? tier.checkoutUrl : `/join/${tier.id}`}
            >Select</a
          >
        </div>
      {/if}
    {/each}
  </div>
</section>
