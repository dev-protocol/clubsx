<template>
  <div
    v-bind:class="`relative hs-wallet${
      truncateWalletAddress &&
      formattedUserBalance.length > 0 &&
      supportedNetwork
        ? ' is-connected'
        : ''
    }`"
  >
    <HSButton
      type="outlined"
      v-if="
        truncateWalletAddress &&
        formattedUserBalance.length > 0 &&
        supportedNetwork
      "
      link="/me"
    >
      {{ truncateWalletAddress }}
    </HSButton>
    <HSButton
      type="outlined"
      v-else-if="truncateWalletAddress && !supportedNetwork"
      v-on:click="connect"
    >
      Unsupported Network
    </HSButton>
    <HSButton type="outlined" v-else v-on:click="connect">
      Connect Wallet
    </HSButton>
    <span
      v-if="truncateWalletAddress && !supportedNetwork"
      class="absolute top-14 z-50 block rounded bg-orange-600 p-4 text-sm shadow"
    >
      Please connect to {{ chainName }}
    </span>
    <ul
      class="hs-wallet__details"
      v-if="
        truncateWalletAddress &&
        formattedUserBalance.length > 0 &&
        supportedNetwork
      "
    >
      <li>Balance: {{ formattedUserBalance }} $DEV</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { providers, utils } from 'ethers'
import truncateEthAddress from 'truncate-eth-address'
import { whenDefined } from '@devprotocol/util-ts'
import { ReConnectWallet, GetModalProvider } from '@fixtures/wallet'
import { connection } from '@devprotocol/clubs-core/connection'
import Core from 'web3modal'
import { defineComponent } from '@vue/runtime-core'
import { clientsDev } from '@devprotocol/dev-kit/agent'
import HSButton from '../Primitives/Hashi/HSButton.vue'

type Data = {
  modalProvider: Core
  truncateWalletAddress: String
  formattedUserBalance: String
  supportedNetwork: boolean
}

export default defineComponent({
  name: 'ConnectButton',
  components: { HSButton },
  props: {
    chainId: Number,
  },
  data(): Data {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      truncateWalletAddress: '',
      formattedUserBalance: '',
      supportedNetwork: false,
    }
  },
  computed: {
    chainName() {
      return this.chainId === 1
        ? 'Ethereum'
        : this.chainId === 137
        ? 'Polygon'
        : this.chainId === 80001
        ? 'Polygon Mumbai'
        : this.chainId === 42161
        ? 'Arbitrum'
        : null
    },
  },
  async mounted() {
    connection().chain.subscribe((chainId: number) => {
      this.supportedNetwork = chainId === this.chainId
    })
    const { currentAddress, provider } = await ReConnectWallet(
      this.modalProvider
    )
    if (currentAddress) {
      this.truncateWalletAddress = truncateEthAddress(currentAddress)
    }
    if (provider) {
      this.setSigner(provider)
    }
    if (currentAddress && provider) {
      this.fetchUserBalance(currentAddress, provider)
    }
  },
  methods: {
    setSigner(provider: providers.Web3Provider) {
      connection().signer.next(provider.getSigner())
    },
    async connect() {
      const connectedProvider = await this.modalProvider.connect()
      const newProvider = whenDefined(connectedProvider, (p) => {
        const provider = new providers.Web3Provider(p)
        this.setSigner(provider)
        return provider
      })

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
      const balance = await (l1 || l2)?.balanceOf(currentAddress)
      const formatted = utils.formatUnits(balance ?? 0)
      const rounded = Math.round((+formatted + Number.EPSILON) * 100) / 100
      this.formattedUserBalance = rounded.toLocaleString()
    },
  },
})
</script>
