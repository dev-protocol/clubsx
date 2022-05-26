<template>
  <div class="rounded border px-4 py-2">
    <div v-if="walletAddress">
      <a href="/me">{{ walletAddress }}</a>
    </div>
    <div v-else v-on:click="connect">Connect Wallet</div>
  </div>
</template>

<script>
import { providers } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import { ReConnectWallet, GetModalProvider } from '../../fixtures/wallet'

export default {
  name: 'ConnectButton',
  data() {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      walletAddress: '',
    }
  },
  async mounted() {
    const { currentAddress } = await ReConnectWallet(this.modalProvider)
    if (currentAddress) {
      this.walletAddress = currentAddress
    }
  },
  methods: {
    async connect() {
      const connectedProvider = await this.modalProvider.connect()
      const newProvider = whenDefined(
        connectedProvider,
        (p) => new providers.Web3Provider(p)
      )

      const currentAddress = await newProvider.getSigner().getAddress()
      this.walletAddress = currentAddress
    },
  },
}
</script>
