<script lang="ts">
  import USDC from '@assets/USDC.svg'
  import ETH from '@assets/ETH.svg'
  import MATIC from '@assets/MATIC.svg'
  import DEV from '@assets/devtoken.png'
  import type { Tiers } from '@constants/tier'
  import { CurrencyOption } from '@constants/currencyOption'

  const counter = new Map<CurrencyOption, number>()

  export let tiers: Tiers
  export let tenantName: string
  export let preferedCurrency: CurrencyOption = tiers.reduce(
    (prev, current) => {
      const count = counter.get(current.currency) ?? 1
      counter.set(current.currency, count)
      return counter.get(prev.currency) ?? 0 < count ? current : prev
    },
  ).currency

  let tierContainer: HTMLElement

  const currencyList: CurrencyOption[] = Array.from(
    new Set([
      preferedCurrency,
      CurrencyOption.USDC,
      CurrencyOption.MATIC,
      CurrencyOption.ETH,
      CurrencyOption.DEV,
    ]),
  )

  let currency: CurrencyOption = preferedCurrency
  let currencies = new Set(tiers.map((t) => t.currency))

  const updateTiers = () => {
    // Requires dynamic styling only for injected currencies.
    currencyList.includes(currency) === false &&
      tierContainer
        .querySelectorAll(`group-[.${currency}-is-checked]:block`)
        .forEach((el) => {
          el.classList.toggle('hidden')
        })
  }
  const switchInputs = async (ev: Event) => {
    const { value } = ev.target as HTMLInputElement
    currency = value as CurrencyOption
    updateTiers()
  }
</script>

<section
  class="flex flex-col rounded-xl bg-dp-white-200 p-4 text-dp-white-ink shadow"
>
  <i class="block hidden"></i>
  <h2 class="mb-4 text-4xl font-bold">Join</h2>
  <!-- DAOName from YAML config -->
  <div class="mb-8">Join {tenantName} in support of the project.</div>

  <h3 class="mb-4 text-2xl font-bold">Purchase with</h3>
  <form
    class={`group mb-8 grid gap-2 ${
      currencies.has(CurrencyOption.DEV) ? 'md:grid-cols-2' : ''
    } ${currency}-is-checked`}
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
              ? USDC.src
              : currencyOption === 'matic'
              ? MATIC.src
              : currencyOption === 'eth'
              ? ETH.src
              : DEV.src}
            alt={currencyOption.toUpperCase()}
            class="h-8 w-8"
          />
          <span class="font-bold">{currencyOption.toUpperCase()}</span>
        </label>
      {/if}
    {/each}
    <slot name="currency:option" />

    <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
    <div class="mb-8 grid gap-8 lg:grid-cols-2" bind:this={tierContainer}>
      <slot name="tier" />
    </div>
  </form>
</section>
