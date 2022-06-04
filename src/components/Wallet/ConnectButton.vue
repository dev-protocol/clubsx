<template>
  <div class="rounded border px-4 py-2">
    <div v-if="truncateWalletAddress && formattedUserBalance.length > 0">
      <div v-if="supportedNetwork">
        <a href="/me">
          <span class="mr-4">{{ formattedUserBalance }} DEV</span>
          <span>{{ truncateWalletAddress }}</span>
        </a>
      </div>
      <div v-else>Unsupported Network</div>
    </div>
    <div v-else v-on:click="connect">Connect Wallet</div>
  </div>
</template>

<script lang="ts">
import { providers, utils } from 'ethers'
import truncateEthAddress from 'truncate-eth-address'
import { whenDefined } from '@devprotocol/util-ts'
import { ReConnectWallet, GetModalProvider } from '../../fixtures/wallet'
import { clientsDev } from '@devprotocol/dev-kit/agent'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'ConnectButton',
  data() {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      truncateWalletAddress: '',
      formattedUserBalance: '',
      supportedNetwork: false,
    }
  },
  async mounted() {
    const { currentAddress, provider } = await ReConnectWallet(
      this.modalProvider
    )
    if (currentAddress) {
      this.truncateWalletAddress = truncateEthAddress(currentAddress)
    }
    if (currentAddress && provider) {
      this.fetchUserBalance(currentAddress, provider)
    }
  },
  methods: {
    async connect() {
      const connectedProvider = await this.modalProvider.connect()
      const newProvider = whenDefined(
        connectedProvider,
        (p) => new providers.Web3Provider(p)
      )

      const currentAddress = await newProvider?.getSigner().getAddress()
      if (currentAddress) {
        this.truncateWalletAddress = truncateEthAddress(currentAddress)
      }
      if (currentAddress && newProvider) {
        this.fetchUserBalance(currentAddress, newProvider)
      }
    },
    async fetchUserBalance(
      currentAddress: string,
      provider: providers.Provider
    ) {
      const [l1, l2] = await clientsDev(provider)
      this.supportedNetwork = l1 || l2 ? true : false
      const balance = await (l1 || l2)?.balanceOf(currentAddress)
      const formatted = utils.formatUnits(balance ?? 0)
      const rounded = Math.round((+formatted + Number.EPSILON) * 100) / 100
      this.formattedUserBalance = rounded.toLocaleString()
    },
  },
})
</script>
