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
      <p class="text-base">How do I create a wallet?</p>
    </section>
    <button
      class="hs-button is-large is-filled"
      @click="connect"
      :disabled="connected || !connection"
    >
      <span class="hs-button__label">
        {{ buttonText }}
      </span>
    </button>
  </section>
</template>

<script lang="ts">
import type Web3Modal from 'web3modal'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import { whenDefined } from '@devprotocol/util-ts'
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'

type Data = {
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
  isAwaitingWalletConfirmation: boolean
  connectButtonTextMsg: string
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
      isAwaitingWalletConfirmation: false,
      connectButtonTextMsg: 'Connect',
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
              : this.isAwaitingWalletConfirmation
              ? ' animate-pulse'
              : '')
    },
    buttonText() {
      return this.connectButtonTextMsg
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

      try {
        this.connection = connection
        this.modalProvider = GetModalProvider()
        this.isAwaitingWalletConfirmation = true
        this.connectButtonTextMsg = 'Fetching wallet details...'
        const { currentAddress, connectedProvider, provider } =
          await ReConnectWallet(this.modalProvider)
        if (currentAddress) {
          this.connected = true
          this.connectButtonTextMsg = 'Connected'
        } else {
          this.connected = false
          this.connectButtonTextMsg = 'Connect'
        }
        if (connectedProvider) {
          this.setSigner(connectedProvider)
        }
      } catch (error) {
        this.connected = false
        this.connectButtonTextMsg = 'Connect'
      } finally {
        this.isAwaitingWalletConfirmation = false
      }
    })
  },
  methods: {
    setSigner(provider: Eip1193Provider) {
      this.connection!().setEip1193Provider(provider)
    },

    async connect() {
      if (this.connected) {
        this.connectButtonTextMsg = 'Connected'
        this.isAwaitingWalletConfirmation = false
        return
      }

      try {
        this.isAwaitingWalletConfirmation = true
        this.connectButtonTextMsg =
          'Awaiting connection confirmation on wallet...'
        const connectedProvider: Eip1193Provider =
          await this.modalProvider!.connect()
        const newProvider = whenDefined(connectedProvider, (p) => {
          const provider = new BrowserProvider(p)
          this.setSigner(connectedProvider)
          return provider
        })

        const currentAddress = await (
          await newProvider?.getSigner()
        )?.getAddress()
        if (currentAddress) {
          this.connected = true
          this.connectButtonTextMsg = 'Connected'
        } else {
          this.connected = false
          this.connectButtonTextMsg = 'Connect'
        }
      } catch (error) {
        this.connected = false
        this.connectButtonTextMsg = 'Wallet connection failed, try again!'
      } finally {
        this.isAwaitingWalletConfirmation = false
      }
    },
  },
})
</script>
