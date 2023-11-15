<template>
  <section class="flex flex-col rounded-xl bg-dp-blue-grey-300 p-4 shadow">
    <h2 class="mb-4 text-4xl font-bold">{{ i18n('Join') }}</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">{{ i18n('JoinTenant', [tenantName]) }}</div>

    <h3 class="mb-4 text-2xl font-bold">{{ i18n('PurchaseWith') }}</h3>
    <form class="mb-8 flex flex-col gap-2 md:flex-row" ref="form">
      <CLBRadio
        v-if="preferedCurrency === 'dev'"
        label="$DEV"
        :media="images.DEV"
        media-alt="Dev Token logo"
        :helper="i18n('SustainableStaking')"
        value="dev"
        :action="switchInputs"
        :checked="currency === 'dev'"
      />
      <CLBRadio
        label="$ETH"
        :media="images.ETH"
        media-alt="Ethereum logo"
        :helper="i18n('Earn')"
        value="eth"
        :checked="currency === 'eth'"
        :action="switchInputs"
      />
    </form>

    <h3 class="mb-4 text-2xl font-bold">{{ i18n('SelectMembership') }}</h3>
    <div class="mb-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
      <Tier
        v-for="tier in composedTiers[currency]"
        v-bind:key="tier.id + tier.amount"
        :title="tier.title"
        :id="tier.id"
        :amount="tier.amount"
        :currency="currency"
        :badgeImageSrc="tier.badgeImageSrc"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import ETH from '@assets/ETH.svg'
import DEV from '@assets/devtoken.png'
import type { Tiers } from '@devprotocol/clubs-core'
import Tier from '@components/Join/Tier.vue'
import { JsonRpcProvider } from 'ethers'
import { composeTiers } from '@fixtures/utility'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { CurrencyOption, i18nFactory } from '@devprotocol/clubs-core'
import CLBRadio from '@components/Primitives/CLBRadio.vue'
import { ref, onMounted } from 'vue'
import { Strings } from './i18n'

type Data = {
  currency: 'dev' | 'eth'
  composedTiers: {
    [key in CurrencyOption]?: UndefinedOr<Tiers>
  }
  images: {
    DEV: string
    ETH: string
  }
}

const { propertyAddress, tiers, tenantName, rpcUrl, preferedCurrency } =
  defineProps<{
    propertyAddress: string
    tiers: Tiers
    tenantName?: string
    rpcUrl?: string
    preferedCurrency?: 'dev' | 'eth'
  }>()

let currency: Data['currency'] = preferedCurrency ?? 'dev'
let composedTiers: Data['composedTiers'] = {
  dev: preferedCurrency === 'dev' ? [...tiers] : undefined,
  eth: preferedCurrency === 'eth' ? [...tiers] : undefined,
}
const images: Data['images'] = {
  DEV: DEV.src,
  ETH: ETH.src,
}
const i18nBase = i18nFactory(Strings)
let i18n = i18nBase(['en'])

let form = ref<HTMLFormElement | null>(null)

onMounted(async () => {
  const input = new FormData(form.value as HTMLFormElement).get('input') as
    | null
    | Data['currency']
  currency = input as 'dev' | 'eth'
  if (preferedCurrency === 'eth') {
    return
  }
  composedTiers = await composeTiers({
    sourceTiers: tiers,
    provider: new JsonRpcProvider(rpcUrl),
    tokenAddress: propertyAddress ?? '',
  })
  i18n = i18nBase(navigator.languages)
})

const switchInputs = (ev: Event) => {
  const { value } = ev.target as HTMLInputElement
  currency = value as 'dev' | 'eth'
}
</script>
