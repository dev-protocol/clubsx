<template>
  <section class="flex flex-col">
    <h2 class="font-title mb-4 text-4xl font-bold">Join</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">Join {DAOName} in support of the project.</div>

    <h3 class="font-title mb-4 text-2xl font-bold">Purchase with</h3>
    <form class="mb-8 flex flex-col" ref="form">
      <label class="flex items-center py-4">
        <input
          class="w-16"
          type="radio"
          id="dev"
          name="input"
          value="dev"
          checked
          @change="switchInputs"
        />
        <span class="w-16">$DEV</span>
        <div class="flex items-center">
          <img
            src="/assets/devtoken.png"
            width="50"
            height="50"
            alt="dev token"
          />
          <span class="content-center justify-between text-sm"
            >Best way to sustainably support with staking.</span
          >
        </div>
      </label>
      <label class="flex items-center">
        <input
          class="w-16"
          type="radio"
          id="eth"
          name="input"
          value="eth"
          @change="switchInputs"
        />
        <span class="w-16">$ETH</span>
        <div class="flex items-center">
          <img src="/assets/ETH.svg" width="50" height="50" alt="ethereum" />
          <span class="content-center justify-between text-sm"
            >You will earn $DEV by staking.
          </span>
        </div>
      </label>
    </form>

    <h3 class="font-title mb-4 text-2xl font-bold">Select a tier</h3>
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
        class="border-native-blue-400 block rounded border p-4 text-xl"
        >Perks →</a
      >
    </section>
  </section>
</template>

<script lang="ts">
import Tier from './Tier.vue'
import { tiers as sourceTiers } from '../../constants/tier'
import type { Tiers } from '../../constants/tier'
import { providers } from 'ethers'
import { composeTiers } from '../../fixtures/utility'
import { UndefinedOr } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/runtime-core'
import { CurrencyOption } from '../../constants/currencyOption'

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
    Tier,
  },
})
</script>
