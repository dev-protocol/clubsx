<template>
  <div class="rounded border px-4 py-2">
    <div v-if="truncateWalletAddress">
      <a href="/me">{{ truncateWalletAddress }}</a>
    </div>
    <div v-else v-on:click="connect">Connect Wallet</div>
  </div>
</template>

<script>
import { providers } from 'ethers'
import truncateEthAddress from 'truncate-eth-address'
import { whenDefined } from '@devprotocol/util-ts'
import { ReConnectWallet, GetModalProvider } from '../../fixtures/wallet'

export default {
  name: 'ConnectButton',
  data() {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      truncateWalletAddress: '',
    }
  },
  async mounted() {
    const { currentAddress } = await ReConnectWallet(this.modalProvider)
    if (currentAddress) {
      this.truncateWalletAddress = truncateEthAddress(currentAddress)
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
      this.truncateWalletAddress = truncateEthAddress(currentAddress)
    },
  },
}
</script>
