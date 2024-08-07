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
  } from '@devprotocol/clubs-core'
  import { CurrencyOption, i18nFactory } from '@devprotocol/clubs-core'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { Strings } from './i18n'
  import { onMount } from 'svelte'

  const counter = new Map<CurrencyOption, number>()
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let tiers: Tiers
  export let injectedTiers: UndefinedOr<InjectedTiers>
  export let tenantName: string
  export let preferedCurrency: UndefinedOr<CurrencyOption> = tiers.reduce(
    (prev, current) => {
      const currency = current.currency as UndefinedOr<Tier['currency']>
      const count = currency ? (counter.get(currency) ?? 1) : 0
      currency && counter.set(currency, count)
      return (currency ? (counter.get(currency) ?? 0) : 0) < count
        ? current
        : prev
    },
  ).currency

  const currencyList: UndefinedOr<CurrencyOption>[] = Array.from(
    new Set([
      preferedCurrency,
      CurrencyOption.USDC,
      CurrencyOption.MATIC,
      CurrencyOption.ETH,
      CurrencyOption.DEV,
      undefined,
    ]),
  )
  const compositeTiers: (Tier | InjectedTier)[] = [
    ...tiers,
    ...(injectedTiers ?? []),
  ]

  let currency: UndefinedOr<CurrencyOption> = preferedCurrency
  let currencies = new Set(tiers.map((t) => t.currency))

  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as CurrencyOption
  }

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<section
  class="flex flex-col rounded-xl bg-dp-white-200 p-4 text-dp-white-ink shadow"
>
  <h2 class="mb-4 text-4xl font-bold">{i18n('Join')}</h2>

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
          {#if currencyOption !== undefined}
            <img
              src={currencyOption === 'usdc'
                ? USDC.src
                : currencyOption === 'matic'
                  ? MATIC.src
                  : currencyOption === 'eth'
                    ? ETH.src
                    : DEV.src}
              alt={currencyOption?.toUpperCase()}
              class="h-8 w-8"
            />
          {/if}
          <span class="font-bold"
            >{currencyOption ? currencyOption.toUpperCase() : 'Unpriced'}</span
          >
        </label>
      {/if}
    {/each}
    <slot name="currency:option" />
  </form>

  <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
  <div class="mb-8 grid gap-8 lg:grid-cols-2">
    {#each compositeTiers.filter((t) => String(t.currency) === String(currency)) as tier, i}
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
