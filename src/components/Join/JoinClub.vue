<template>
  <section class="bg-dp-blue-grey-300 flex flex-col rounded-xl p-4 shadow">
    <h2 class="mb-4 text-4xl font-bold">Join</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">Join {{ tenantName }} in support of the project.</div>

    <h3 class="mb-4 text-2xl font-bold">Purchase with</h3>
    <form class="mb-8 flex flex-col gap-2 md:flex-row" ref="form">
      <CLBRadio
        v-if="preferedCurrency === 'dev'"
        label="$DEV"
        :media="images.DEV"
        media-alt="Dev Token logo"
        helper="Best way to sustainably support with staking."
        value="dev"
        :action="switchInputs"
        :checked="currency === 'dev'"
      />
      <CLBRadio
        label="$ETH"
        :media="images.ETH"
        media-alt="Ethereum logo"
        helper="You will earn $DEV by staking."
        value="eth"
        :checked="currency === 'eth'"
        :action="switchInputs"
      />
    </form>

    <h3 class="mb-4 text-2xl font-bold">Select a membership</h3>
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

<script lang="ts">
import ETH from '@assets/ETH.svg'
import DEV from '@assets/devtoken.png'
import type { Tiers } from '@constants/tier'
import Tier from '@components/Join/Tier.vue'
import { JsonRpcProvider } from 'ethers'
import { composeTiers } from '@fixtures/utility'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { defineComponent, PropType } from '@vue/runtime-core'
import type { CurrencyOption } from '@constants/currencyOption'
import CLBRadio from '@components/Primitives/CLBRadio.vue'

type Data = {
  currency: 'dev' | 'eth'
  composedTiers: {
    [key in CurrencyOption]: UndefinedOr<Tiers>
  }
  images: {
    DEV: string
    ETH: string
  }
}

export default defineComponent({
  name: 'JoinClub',
  props: {
    propertyAddress: String,
    tiers: {
      type: Array as PropType<Tiers>,
      required: true,
    },
    tenantName: String,
    rpcUrl: String,
    preferedCurrency: {
      type: String as PropType<'dev' | 'eth'>,
      required: true,
    },
  },
  data(): Data {
    return {
      currency: this.preferedCurrency,
      composedTiers: {
        dev: this.preferedCurrency === 'dev' ? [...this.tiers] : undefined,
        eth: this.preferedCurrency === 'eth' ? [...this.tiers] : undefined,
      },
      images: {
        DEV,
        ETH,
      },
    }
  },
  async mounted() {
    const input = new FormData(this.$refs.form as HTMLFormElement).get(
      'input',
    ) as null | Data['currency']
    this.currency = input as 'dev' | 'eth'
    if (this.preferedCurrency === 'eth') {
      return
    }
    this.composedTiers = await composeTiers({
      sourceTiers: this.tiers,
      provider: new JsonRpcProvider(this.rpcUrl),
      tokenAddress: this.propertyAddress ?? '',
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
