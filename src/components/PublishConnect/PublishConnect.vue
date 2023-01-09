<template>
  <section class="flex grid-cols-2 items-center justify-start gap-8">
    <section class="grid w-[49%] gap-3">
      <p class="font-mono text-base font-normal">1/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img alt="Status" :src="checkImage" class="h-6 w-6" />
        <h2 v-bind:class="stepTextClasses">Connect your wallet</h2>
      </section>
      <p class="text-base">How to create a wallet?</p>
    </section>
    <section class="w-[49%] gap-4 p-4">
      <button
        v-bind:class="buttonClasses"
        @click="connect"
        :disabled="connected"
      >
        <p class="font-DMSans text-base font-bold text-[#FFFFFF]">
          {{ buttonText }}
        </p>
      </button>
    </section>
  </section>
</template>

<script lang="ts">
import type Web3Modal from 'web3modal'
import { providers, utils } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'

type Data = {
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
}

export default defineComponent({
  name: 'PublishConnect',
  props: {
    checkImage: String,
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      connected: false,
    }
  },
  computed: {
    buttonClasses() {
      const classes =
        'w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8'

      return this.connected ? classes + ' opacity-50' : classes
    },
    buttonText() {
      return this.connected ? 'Connected' : 'Connect'
    },
    stepTextClasses() {
      const classes = 'font-title text-2xl font-bold'

      return this.connected ? classes + ' line-through opacity-50' : classes
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
  },
  methods: {
    setSigner(provider: providers.Web3Provider) {
      this.connection!().signer.next(provider.getSigner())
    },

    async connect() {
      if (this.connected) return

      const connectedProvider = await this.modalProvider!.connect()
      const newProvider = whenDefined(connectedProvider, (p) => {
        const provider = new providers.Web3Provider(p)
        this.setSigner(provider)
        return provider
      })

      const currentAddress = await newProvider?.getSigner().getAddress()
      if (currentAddress) {
        this.connected = true
      }
    },
  },
})
</script>
