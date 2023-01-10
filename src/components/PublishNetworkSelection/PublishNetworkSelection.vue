<template>
  <!-- Step 2 -->
  <section class="flex grid-cols-2 items-center justify-start gap-8">
    <section class="grid w-[49%] gap-3">
      <p class="font-mono text-base font-normal">2/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img alt="Status" :src="checkImage" class="h-6 w-6" />
        <h2 v-bind:class="step2TextClasses">Choose network</h2>
      </section>
      <p class="text-base">What is the different between networks?</p>
    </section>
    <section class="grid w-[49%] grid-cols-3 gap-4 p-4">
      <button
        @click="changeNetwork('polygon')"
        class="rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="
          !connected
            ? 'opacity-50'
            : networkSelected === ''
            ? ''
            : networkSelected === 'polygon'
            ? 'opacity-50'
            : 'opacity-20'
        "
        :disabled="!connected"
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
          !connected
            ? 'opacity-50'
            : networkSelected === ''
            ? ''
            : networkSelected === 'arbitrum'
            ? 'opacity-50'
            : 'opacity-20'
        "
        :disabled="!connected"
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Arbitrum
        </p>
      </button>
      <button
        @click="changeNetwork('ethereum')"
        class="rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="
          !connected
            ? 'opacity-50'
            : networkSelected === ''
            ? ''
            : networkSelected === 'ethereum'
            ? 'opacity-50'
            : 'opacity-20'
        "
        :disabled="!connected"
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Ethereum
        </p>
      </button>
    </section>
  </section>

  <!-- Step 3 -->
  <section class="flex grid-cols-2 items-start justify-start gap-8">
    <section class="grid w-[49%] gap-3">
      <p class="font-mono text-base font-normal">3/</p>
      <h2 v-bind:class="step3TextClasses">Activate</h2>
    </section>
    <section class="w-[49%] p-4">
      <section class="mb-5 flex items-center justify-between">
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img alt="Status" :src="roundedSquareImage" class="h-3 w-3" />
          <p class="font-DMSans text-base font-bold" v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'text-[#3A4158]' : 'text-white'">1</p>
        </section>
        <div
          class="ml-4 mr-7 h-0 flex-1 border-[1px]"
          v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'border-[#3A4158]' : 'border-white'"
        ></div>
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img alt="Status" :src="roundedSquareImage" class="h-3 w-3" />
          <p class="font-DMSans text-base font-bold" v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'text-[#3A4158]' : 'text-white'">2</p>
        </section>
        <div
          class="ml-4 mr-7 h-0 flex-1 border-[1px]"
          v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'border-[#3A4158]' : 'border-white'"
        ></div>
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img alt="Status" :src="roundedSquareImage" class="h-3 w-3" />
          <p class="font-DMSans text-base font-bold" v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'text-[#3A4158]' : 'text-white'">3</p>
        </section>
      </section>
      <button
        class="mb-4 w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 text-center"
        v-bind:class="networkSelected === '' || !networkSelected || !connected ? 'opacity-50' : ''"
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          Activate
        </p>
      </button>
      <p class="font-DMSans text-base font-normal text-white">
        What is activating?
      </p>
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
  popupWindow: Window | null
}

export default defineComponent({
  name: 'PublishNetworkSelection',
  props: {
    checkImage: String,
    roundedSquareImage: String,
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      networkSelected: '',
      connected: false,
      popupWindow: null as Window | null,
    }
  },
  computed: {
    buttonClasses() {
      const classes =
        'w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8'

      return this.connected ? classes + ' opacity-50' : classes
    },
    step2TextClasses() {
      const classes = 'font-title text-2xl font-bold'
      return this.connected
        ? this.networkSelected === '' || !this.networkSelected
          ? classes
          : classes + ' line-through opacity-50'
        : classes + ' opacity-50'
    },
    step3TextClasses() {
      const classes = 'font-title text-2xl font-bold'

      return !this.connected || this.networkSelected === '' || !this.networkSelected
        ? classes + ' opacity-50'
        : classes
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

    openNiwa(link: string) {
      const popupLink = link + '?popup=true'
      this.popupWindow = window.open(
        popupLink,
        'Niwa',
        'popup,width=500,height=700'
      )
      if (this.popupWindow) {
        this.popupWindow.addEventListener(
          'message',
          this.listenForAddress,
          false
        )
      }
    },

    listenForAddress(event: MessageEvent<any>) {
      if (event.source !== this.popupWindow) return

      const { address } = event.data
      if (!address) return

      const link = `/almost-there?network=${this.networkSelected}&address=${address}`
      window.location.href = link
      return
    },
  },
})
</script>
