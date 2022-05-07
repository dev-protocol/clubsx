<template>
  <div class="flex items-center">
    <div
      class="w-16 h-16"
      :style="`background-image: url('${image}');background-repeat: no-repeat; background-size: contain; background-position: center center;`"
    />
    <div class="mr-4">#{{ stokenID }}</div>
    <div>{{ amount || '-' }} DEV</div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import { getStokenPositions, getStokenTokenURI } from '../../fixtures/dev-kit'
import { toNaturalNumber } from '../../fixtures/utility'

export default {
  name: 'STokenPositions',
  props: ['stokenID'],
  data() {
    return {
      amount: undefined,
      image: undefined,
    }
  },
  async created() {
    const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    const provider = new providers.JsonRpcProvider(providerURL)
    console.log(this.propertyAddress, this.accountAddress)

    const balances = await getStokenPositions(provider, this.stokenID)
    const uri = await getStokenTokenURI(provider, this.stokenID)
    this.amount = toNaturalNumber(new BigNumber(balances.amount))
      .dp(0)
      .toNumber()
    this.image = uri.image
    console.log('b:', balances, uri)
  },
}
</script>
