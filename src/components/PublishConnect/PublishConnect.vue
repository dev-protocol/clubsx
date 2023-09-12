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
    <ConnectButton
      lable="buttonText"
      :overrideClass="buttonClasses"
      :isDisabled="connected || !connection"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import ConnectButton from '@components/Wallet/ConnectButton.vue'
import { onMountClient } from '@devprotocol/clubs-core/events'
import { watchWalletClient } from '@wagmi/core'
import { whenDefined } from '@devprotocol/util-ts'
import { BrowserProvider } from 'ethers'

type Data = {
  connected: boolean
  connection?: typeof Connection
  isAwaitingWalletConfirmation: boolean
  connectButtonTextMsg: string
}

export default defineComponent({
  name: 'PublishConnect',
  components: { ConnectButton },
  props: {
    checkImage: String,
  },
  data(): Data {
    return {
      connection: undefined,
      connected: false,
      isAwaitingWalletConfirmation: false,
      connectButtonTextMsg: 'Connect',
    }
  },
  computed: {
    buttonClasses() {
      const classes = 'hs-button is-large is-filled w-full'

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
      this.connected = false
      this.connectButtonTextMsg = 'Fetching wallet details...'

      const { connection } = await import('@devprotocol/clubs-core/connection')
      this.connection = connection

      watchWalletClient({}, (wallet) => {
        whenDefined(wallet, (wal) =>
          connection().setEip1193Provider(wal.transport, BrowserProvider),
        ) ?? connection().signer.next(undefined)
      })

      connection().account.subscribe((account) => {
        if (account) {
          this.connected = true
          this.connectButtonTextMsg = 'Connected'
        } else {
          this.connected = false
          this.connectButtonTextMsg = 'Connect'
        }

        this.isAwaitingWalletConfirmation = false
      })
    })
  },
})
</script>
