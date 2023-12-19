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
  import { CLBRadio } from '@devprotocol/clubs-core/ui/svelte';

  const counter = new Map<CurrencyOption, number>()
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

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

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<section
  class="flex flex-col rounded-xl bg-surface-400 p-10 text-surface-ink shadow bg-opacity-40"
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
        <CLBRadio
          label={currencyOption.toUpperCase()}
          value={currencyOption}
          isChecked={preferedCurrency === currencyOption}
          media={currencyOption === 'usdc'
              ? USDC.src
              : currencyOption === 'matic'
                ? MATIC.src
                : currencyOption === 'eth'
                  ? ETH.src
                  : DEV.src}
          mediaAlt={`${currencyOption.toUpperCase()} icon.`}
        />
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
            class="mt-2 hs-button is-filled is-fullwidth"
            id={`select-opt-${i}-${currency}`}
            href={'checkoutUrl' in tier ? tier.checkoutUrl : `/join/${tier.id}`}
            >Select</a
          >
        </div>
      {/if}
    {/each}
  </div>
</section>
