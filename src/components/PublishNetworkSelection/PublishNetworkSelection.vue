<template>
  <section class="flex grid-cols-2 items-center justify-start gap-8">
    <section class="grid w-[49%] gap-3">
      <p class="font-mono text-base font-normal">2/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img alt="Status" :src="checkImage" class="h-6 w-6" />
        <h2 v-bind:class="stepTextClasses">Choose network</h2>
      </section>
      <p class="text-base">What is the different between networks?</p>
    </section>
    <section class="grid w-[49%] grid-cols-3 gap-4 p-4">
      <button
        @click="changeNetwork('polygon')"
        class="rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="
          connected && networkSelected === 'polygon' ? 'opacity-50' : ''
        "
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Polygon
        </p>
        <p class="font-DMSans text-center text-xs font-medium text-[#FFFFFF]">
          Recommended
        </p>
      </button>
      <button
        @click="changeNetwork('arbitrum')"
        class="rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="
          connected && networkSelected === 'arbitrum' ? 'opacity-50' : ''
        "
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Arbitrum
        </p>
      </button>
      <button
        @click="changeNetwork('ethereum')"
        class="rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="
          connected && networkSelected === 'ethereum' ? 'opacity-50' : ''
        "
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Ethereum
        </p>
      </button>
    </section>
  </section>
</template>

<script lang="ts">
import { providers } from 'ethers'
import type Web3Modal from 'web3modal'
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'

type Data = {
  networkSelected: String
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
}

export default defineComponent({
  name: 'PublishNetworkSelection',
  props: {
    checkImage: String,
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      networkSelected: '',
      connected: false,
    }
  },
  computed: {
    buttonClasses() {
      const classes =
        'w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8'

      return this.connected ? classes + ' opacity-50' : classes
    },
    stepTextClasses() {
      const classes = 'font-title text-2xl font-bold'
      console.log('This', this.networkSelected, !this.networkSelected)
      return this.connected
        ? this.networkSelected === '' || !this.networkSelected
          ? classes
          : classes + ' line-through opacity-50'
        : classes + ' opacity-50'
    },
  },
  async mounted() {
    const [{ connection }, { GetModalProvider, ReConnectWallet }] =
      await Promise.all([
        import('@devprotocol/clubs-core/connection'),
        import('@fixtures/wallet'),
      ])
    this.connection = connection
    this.modalProvider = GetModalProvider()
    const { currentAddress } = await ReConnectWallet(this.modalProvider)
    if (currentAddress) {
      this.connected = true
    }
  },
  methods: {
    setSigner(provider: providers.Web3Provider) {
      this.connection!().signer.next(provider.getSigner())
    },

    async changeNetwork(network: string) {
      if (!this.connected) return

      this.networkSelected = network
    },
  },
})
</script>
