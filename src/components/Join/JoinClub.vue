<template>
  <section class="flex flex-col">
    <h2 class="mb-4 text-4xl">Join</h2>
    <div class="mb-8">Join Awesome Club in support of the awesome project.</div>

    <h3 class="mb-4 text-2xl">Support with</h3>
    <form class="mb-8 flex flex-col" ref="form">
      <label class="flex items-center py-4">
        <input
          class="w-16"
          type="radio"
          id="dev"
          name="input"
          value="dev"
          @change="switchInputs"
        />
        <span class="w-16">$DEV</span>
        <img
          src="/assets/devtoken.png"
          width="50"
          height="50"
          alt="dev token"
        />
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
            >$ETH is automatically replaced with $DEV</span
          >
        </div>
      </label>
    </form>

    <h3 class="mb-4 text-2xl">Select a tier</h3>
    <div class="mb-8 grid grid-cols-3 gap-8">
      <Tier
        v-for="tier in tiers[currency]"
        v-bind:key="tier.id"
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
import Tier from './Tier.vue'
import { tiers as sourceTiers } from '../../constants/tier'
import type { Tiers } from '../../constants/tier'
import { providers } from 'ethers'
import { convertTiersToEth } from 'src/fixtures/utility'
import { UndefinedOr } from '@devprotocol/util-ts'

const provider = new providers.JsonRpcProvider(
  import.meta.env.PUBLIC_WEB3_PROVIDER_URL
)
const tokenAddress = import.meta.env.PUBLIC_PROPERTY_ADDRESS

type Data = {
  currency: 'dev' | 'eth'
  tiers: {
    dev: Tiers
    eth: UndefinedOr<Tiers>
  }
}

export default {
  name: 'JoinClub',
  data(): Data {
    return {
      currency: 'dev',
      tiers: {
        dev: [...sourceTiers],
        eth: undefined,
      },
    }
  },
  async created() {
    // @ts-ignore
    this.tiers.eth = await convertTiersToEth({
      sourceTiers,
      provider,
      tokenAddress,
    })
  },
  mounted() {
    const input = new FormData(this.$refs.form as HTMLFormElement).get(
      'input'
    ) as null | Data['currency']
    // @ts-ignore
    this.currency = input
  },
  methods: {
    async switchInputs(ev: Event) {
      const { value } = ev.target as HTMLInputElement
      // @ts-ignore
      this.currency = value
    },
  },
  components: {
    Tier,
  },
}
</script>
