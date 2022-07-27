<template>
  <div class="flex items-center" v-if="layout === 'default'">
    <div
      class="h-16 w-16"
      :style="`background-image: url('${image}');background-repeat: no-repeat; background-size: contain; background-position: center center;`"
    />
    <div class="mr-4">#{{ stokenID }}</div>
    <div>{{ amount || '-' }} DEV</div>
  </div>
  <div v-else>
    <div
      class="h-64 w-64"
      :style="`background-image: url('${image}');background-repeat: no-repeat; background-size: contain; background-position: center start;`"
    />
    <div class="mr-4 text-2xl">#{{ stokenID }}</div>
    <div>{{ amount || '-' }} DEV</div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import { getStokenPositions, getStokenTokenURI } from '../../fixtures/dev-kit'
import { toNaturalNumber, validImageUri } from '../../fixtures/utility'

export default {
  name: 'STokenPositions',
  props: ['stokenID', 'layout'],
  data() {
    return {
      amount: undefined,
      image: undefined,
      layout: this.layout ? this.layout : 'default',
    }
  },
  async created() {
    const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    const provider = new providers.JsonRpcProvider(providerURL)

    const balances = await getStokenPositions(provider, this.stokenID)
    const uri = await getStokenTokenURI(provider, this.stokenID)
    this.amount = toNaturalNumber(new BigNumber(balances.amount))
      .dp(0)
      .toNumber()
    this.image = validImageUri(uri.image)
  },
}
</script>
