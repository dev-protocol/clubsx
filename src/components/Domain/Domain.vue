<script lang="ts">
import { Comment } from 'vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'
import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
import { ClubsConfiguration, encode } from '@devprotocol/clubs-core'
import { utils } from 'ethers'
import { defaultPlugins } from '@constants/plugins'

export default {
  name: 'AlmostThere',
  components: { HSButton },
  data: () => ({
    daoName: '',
    dbSetStatus: '',
  }),
  methods: {
    async setDb() {
      if (!this.daoName || this.daoName === '') {
        this.dbSetStatus = 'invalid-dao-name'
        return
      }
      const configuration: ClubsConfiguration = {
        name: this.daoName,
        twitterHandle: '',
        description: '',
        url: '',
        propertyAddress: this.address ?? '',
        adminRolePoints: 0,
        options: [],
        plugins: defaultPlugins,
        chainId: this.network ? +this.network : 1, // need to ensure this is correct...
        rpcUrl: '',
      }
      const modalProvider = GetModalProvider()
      const { provider, currentAddress } = await ReConnectWallet(modalProvider)
      if (!currentAddress || !provider) {
        this.dbSetStatus = 'wallet-not-connected'
        return
      }
      const signer = provider.getSigner()

      const config = encode(configuration)
      const hash = await utils.hashMessage(config)
      const sig = await signer.signMessage(hash)
      if (!sig) {
        return
      }

      const body = {
        site: this.daoName
          .toLowerCase()
          .split(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\s+]/)
          .filter((i) => i && i !== ' ')
          .join('-'),
        config,
        hash,
        sig,
        expectedAddress: currentAddress,
      }

      // Save the config to db, this is the same as updateConfig in the admin sections.
      const res = await fetch('/setConfig', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const isConfigSet = res.ok
      if (isConfigSet) {
        this.dbSetStatus = 'successful'
      } else {
        this.dbSetStatus = 'failed'
      }

      if (isConfigSet) {
        const host = window.location.host
        window.location.href = `https://${body.site}.${host}/setup/connect`
      }
    },
  },
  computed: {
    network() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('network')
    },
    address() {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('address')
    },
  },
}
</script>

<template>
  <div class="mt-[10%] flex flex-col items-center justify-items-center">
    <section class="mb-16 mt-8">
      <h1 class="mb-2 text-center font-title text-7xl font-bold">
        It All Starts <br />
        with a Domain
      </h1>
    </section>
    <section class="mb-16">
      <div class="flex items-center">
        <input
          class="rounded bg-gray-700 py-4 pl-8 pr-1 text-right"
          v-model="daoName"
          id="daoname"
          name="daoname"
          placeholder="Enter your DAO name"
          required
        />
        <span class="ml-1 text-lg">.clubs.xyz</span>
      </div>
    </section>
    <section class="mb-16" v-if="dbSetStatus !== ''">
      <!-- Depending on access logic, show either one -->
      <div v-if="dbSetStatus == 'successful'">
        <h1 class="font-title text-xl font-black text-green-500">
          Your DAO is setting up!
        </h1>
      </div>
      <div class="text-red-500" v-else-if="dbSetStatus == 'invalid-dao-name'">
        <h1 class="font-title text-xl font-black">
          Enter valid DAO name, it cannot be empty
        </h1>
      </div>
      <div class="text-red-500" v-else-if="dbSetStatus == 'failed'">
        <h1 class="font-title text-xl font-black">
          An error occured during setting your DAO.
        </h1>
      </div>
      <div
        class="text-red-500"
        v-else-if="dbSetStatus == 'wallet-not-connected'"
      >
        <h1 class="font-title text-xl font-black">
          Connect your wallet before setting your DAO.
        </h1>
      </div>
    </section>
    <section class="mb-4">
      <HSButton
        @click.prevent="setDb()"
        type="outlined"
        class="w-full gap-0.5 py-2 px-6"
        >Next</HSButton
      >
    </section>
  </div>
</template>
