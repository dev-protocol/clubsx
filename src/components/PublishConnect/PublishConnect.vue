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
    <ConnectButton />
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'
import ConnectButton from '@components/Wallet/ConnectButton.vue'

type Data = {
  connected: boolean
  connection?: typeof Connection
  connectButtonTextMsg: string
}

export default defineComponent({
  name: 'PublishConnect',
  props: {
    checkImage: String,
  },
  components: { ConnectButton },
  data(): Data {
    return {
      connection: undefined,
      connected: false,
      connectButtonTextMsg: 'Connect',
    }
  },
  computed: {
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
      const [{ connection }] = await Promise.all([
        import('@devprotocol/clubs-core/connection'),
      ])

      connection().account.subscribe((acc) => {
        this.connected = Boolean(acc)
      })
    })
  },
})
</script>
