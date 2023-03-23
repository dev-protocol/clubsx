<template>
  <button
    class="m-0 w-full max-w-full whitespace-normal text-center text-base font-bold leading-normal text-white"
    :disabled="isAdded || !connected"
    @click="addPluginToClub"
  >
    Add to your {{ clubName }}
  </button>
</template>

<script lang="ts">
import type { ethers } from 'ethers'
import type Web3Modal from 'web3modal'
import { defineComponent, PropType } from 'vue'
import type { PluginMeta } from '@constants/plugins'
import type { BaseProvider } from '@ethersproject/providers'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'

type Data = {
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
  currentWalletAddress: string
}

let provider: BaseProvider | undefined
let signer: ethers.Signer | undefined

export default defineComponent({
  name: 'AddPluginButton',
  props: {
    clubName: {
      type: String,
      default: 'Club',
    },
    plugin: {
      type: Object as PropType<PluginMeta>,
      default: {},
    },
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      connected: false,
      currentWalletAddress: '',
    }
  },
  computed: {
    isAdded(): boolean {
      return this.plugin.added
    },
  },
  methods: {
    async addPluginToClub() {
      console.log('HERE', this.connected, this.plugin)
    },
  },
  async mounted() {
    onMountClient(async () => {
      const [{ connection }] = await Promise.all([
        import('@devprotocol/clubs-core/connection'),
      ])
      this.connection = connection

      connection().provider.subscribe(async (prov) => {
        provider = prov
      })
      connection().signer.subscribe(async (sig) => {
        signer = sig
      })

      connection().account.subscribe(async (acc) => {
        if (acc) {
          this.currentWalletAddress = acc
          this.connected = true
        }
      })
    })
  },
})
</script>
