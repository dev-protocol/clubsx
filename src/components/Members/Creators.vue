<template>
  <div class="bg-cover bg-center">
    <h3 class="my-8 text-2xl">Creators</h3>
    <div v-if="creators.length > 0" class="border-dp-black-200 rounded border">
      <ul role="list">
        <li
          v-for="creator in creators"
          :key="creator.ownerAddress"
          class="border-dp-black-200 flex items-center border border-x-0 border-t-0 outline-white first:border-solid last:border-none"
        >
          <Avator
            :accountAddress="creator.accountAddress"
            :displayName="true"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ethers, providers, utils } from 'ethers'
import { getBalances } from '@fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'

export default {
  props: {
    propertyAddress: String,
    rpcUrl: String,
  },
  data() {
    return {
      creators: [],
    }
  },
  async created() {
    const providerURL = this.rpcUrl
    const provider = new providers.JsonRpcProvider(providerURL)
    const balances =
      this.propertyAddress !== ethers.constants.AddressZero &&
      this.propertyAddress !== '' &&
      this.propertyAddress
        ? await getBalances(provider, this.propertyAddress)
        : []
    this.creators = balances.map((balance) => ({
      accountAddress: balance.account,
    }))
  },
  components: {
    Avator,
  },
}
</script>
