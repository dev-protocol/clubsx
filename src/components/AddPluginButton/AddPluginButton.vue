<template>
  <button
    class="m-0 w-full max-w-full whitespace-normal text-center text-base font-bold leading-normal text-white"
    :disabled="isAdded || !connected || isAddingPluginToClubs"
    @click="addPluginToClub"
    v-bind:class="
      isAddingPluginToClubs
        ? 'cursor-progress'
        : isAdded || !connected
        ? 'cursor-not-allowed'
        : 'cursor-pointer'
    "
  >
    {{ addingPluginToClubsStatusMsg }}
  </button>
</template>

<script lang="ts">
import { utils } from 'ethers'
import type Web3Modal from 'web3modal'
import { defineComponent, PropType } from 'vue'
import type { PluginMeta } from '@constants/plugins'
import type { BaseProvider } from '@ethersproject/providers'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'
import { EthersProviderFrom, GetModalProvider } from '@fixtures/wallet'

type Data = {
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
  isAddingPluginToClubs: boolean
  addingPluginToClubsStatusMsg: string
}

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
      addingPluginToClubsStatusMsg: `Add to your ${this.clubName}`,
      isAddingPluginToClubs: false,
    }
  },
  computed: {
    isAdded(): boolean {
      return this.plugin.added
    },
  },
  methods: {
    async addPluginToClub() {
      this.isAddingPluginToClubs = true
      this.addingPluginToClubsStatusMsg = 'Adding plugin...'

      // Fetch the site info
      const splitHostname = window.location.hostname.split('.')
      const site = splitHostname[0]

      // Fetch and connect provider, wallet and signer.
      const modalProvider = GetModalProvider()
      const { provider, currentAddress } = await EthersProviderFrom(
        modalProvider
      )
      if (!currentAddress || !provider) {
        this.isAddingPluginToClubs = false
        this.addingPluginToClubsStatusMsg = 'Adding failed, try again!'
        return
      }
      const signer = provider.getSigner()
      this.connection && this.connection().signer.next(signer)

      // Sign the data.
      const hash = utils.hashMessage(this.plugin.id)
      let sig: string
      try {
        sig = await signer.signMessage(hash)
      } catch (error) {
        this.isAddingPluginToClubs = false
        this.addingPluginToClubsStatusMsg = 'Adding failed, try again!'
        return
      }
      if (!sig) {
        this.isAddingPluginToClubs = false
        this.addingPluginToClubsStatusMsg = 'Adding failed, try again!'
        return
      }

      const body: {
        site: string
        pluginId: string
        hash: string
        sig: string
      } = {
        site,
        pluginId: this.plugin.id,
        hash,
        sig,
      }

      const res = await fetch('/api/plugins/addPluginToClub', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        this.isAddingPluginToClubs = false
        this.addingPluginToClubsStatusMsg =
          'Add successful, refreshing plugin...'
        window.location.reload()
      } else {
        this.isAddingPluginToClubs = false
        this.addingPluginToClubsStatusMsg = 'Adding failed, try again!'
      }
    },
  },
  async mounted() {
    onMountClient(async () => {
      const [{ connection }] = await Promise.all([
        import('@devprotocol/clubs-core/connection'),
      ])

      this.connection = connection
      connection().account.subscribe(async (acc) => {
        if (acc) {
          this.connected = true
        }
      })
    })
  },
})
</script>
