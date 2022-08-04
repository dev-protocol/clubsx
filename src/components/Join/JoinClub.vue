<template>
  <section class="flex flex-col">
    <h2 class="mb-4 font-title text-4xl font-bold">Join</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">Join {DAOName} in support of the project.</div>

    <h3 class="mb-4 font-title text-2xl font-bold">Purchase with</h3>
    <form class="mb-8 flex flex-col gap-2 md:flex-row" ref="form">
      <CLBRadio
        label="$DEV"
        media="/assets/devtoken.png"
        media-alt="Dev Token logo"
        helper="Best way to sustainably support with staking."
        value="dev"
        :action="switchInputs"
      />
      <CLBRadio
        label="$ETH"
        media="/assets/ETH.svg"
        media-alt="Ethereum logo"
        helper="You will earn $DEV by staking."
        value="eth"
        :action="switchInputs"
      />
    </form>

    <h3 class="mb-4 font-title text-2xl font-bold">Select a tier</h3>
    <div class="mb-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
      <Tier
        v-for="tier in tiers[currency]"
        v-bind:key="tier.id + tier.amount"
        :title="tier.title"
        :id="tier.id"
        :amount="tier.amount"
        :currency="currency"
        :badgeImageSrc="tier.badgeImageSrc"
      />
    </div>

    <section>
      <a
        href="/perks"
        class="block rounded border border-native-blue-400 p-4 text-xl transition-all duration-[var(--hs-transition-time)] ease-in-out hover:bg-[rgba(116,172,255,0.2)]"
        >Perks →</a
      >
    </section>
  </section>
</template>

<script lang="ts">
import Tier from '@components/Join/Tier.vue'
import { tiers as sourceTiers } from '@constants/tier'
import type { Tiers } from '@constants/tier'
import { providers } from 'ethers'
import { composeTiers } from '@fixtures/utility'
import { UndefinedOr } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/runtime-core'
import { CurrencyOption } from '@constants/currencyOption'
import CLBRadio from '@components/Primitives/CLBRadio.vue'

const provider = new providers.JsonRpcProvider(
  import.meta.env.PUBLIC_WEB3_PROVIDER_URL
)
const tokenAddress = import.meta.env.PUBLIC_PROPERTY_ADDRESS

type Data = {
  currency: 'dev' | 'eth'
  tiers: {
    [key in CurrencyOption]: UndefinedOr<Tiers>
  }
}

export default defineComponent({
  name: 'JoinClub',
  data(): Data {
    return {
      currency: 'dev',
      tiers: { dev: [...sourceTiers], eth: undefined },
    }
  },
  async mounted() {
    const input = new FormData(this.$refs.form as HTMLFormElement).get(
      'input'
    ) as null | Data['currency']
    this.currency = input as 'dev' | 'eth'
    this.tiers = await composeTiers({
      sourceTiers,
      provider,
      tokenAddress,
    })
  },
  methods: {
    async switchInputs(ev: Event) {
      const { value } = ev.target as HTMLInputElement
      this.currency = value as 'dev' | 'eth'
    },
  },
  components: {
    CLBRadio,
    Tier,
  },
})
</script>
