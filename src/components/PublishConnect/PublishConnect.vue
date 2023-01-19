<template>
  <section class="grid items-center justify-start gap-8 md:grid-cols-2">
    <section class="grid gap-3">
      <p class="font-mono text-base font-normal">1/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img v-if="connected" alt="Status" :src="checkImage" class="h-6 w-6" />
        <h2 v-bind:class="stepTextClasses">Connect your wallet</h2>
      </section>
      <p class="text-base">How to create a wallet?</p>
    </section>
    <button
      v-bind:class="buttonClasses"
      @click="connect"
      :disabled="connected || !connection"
    >
      <p class="font-DMSans text-base font-bold text-[#FFFFFF]">
        {{ buttonText }}
      </p>
    </button>
  </section>
</template>

<script lang="ts">
import type Web3Modal from 'web3modal'
import { providers } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'

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
      const classes = 'hs-button is-large is-filled'

      return this.connected
        ? classes + ' opacity-50'
        : classes +
            (!this.connection
              ? ' animate-pulse cursor-progress rounded bg-gray-500/60'
              : '')
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
    onMountClient(async () => {
      const [{ connection }, { GetModalProvider, ReConnectWallet }] =
        await Promise.all([
          import('@devprotocol/clubs-core/connection'),
          import('@fixtures/wallet'),
        ])
      this.connection = connection
      this.modalProvider = GetModalProvider()
      const { currentAddress, provider } = await ReConnectWallet(
        this.modalProvider
      )
      if (currentAddress) {
        this.connected = true
      }
      if (provider) {
        this.setSigner(provider)
      }
    })
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
