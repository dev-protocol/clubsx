<script lang="ts">
import { Comment } from 'vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'
// import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
import { ClubsConfiguration, encode } from '@devprotocol/clubs-core'
// import { utils } from 'ethers'
import { defaultPlugins } from '@constants/plugins'

export default {
  name: 'AlmostThere',
  components: { HSButton },
  data: () => ({
    daoName: '',
    dbSetStatus: '',
  }),
  methods: {
    // async setDb() {
    //   if (!this.daoName || this.daoName === '') {
    //     this.dbSetStatus = 'invalid-dao-name'
    //     return
    //   }
    //   const configuration: ClubsConfiguration = {
    //     name: this.daoName,
    //     twitterHandle: '',
    //     description: '',
    //     url: '',
    //     propertyAddress: this.address ?? '',
    //     adminRolePoints: 0,
    //     options: [],
    //     plugins: defaultPlugins,
    //     chainId: this.network ? +this.network : 1, // need to ensure this is correct...
    //     rpcUrl: '',
    //   }
    //   const modalProvider = GetModalProvider()
    //   const { provider, currentAddress } = await ReConnectWallet(modalProvider)
    //   if (!currentAddress || !provider) {
    //     this.dbSetStatus = 'wallet-not-connected'
    //     return
    //   }
    //   const signer = provider.getSigner()
    //   const config = encode(configuration)
    //   const hash = await utils.hashMessage(config)
    //   const sig = await signer.signMessage(hash)
    //   if (!sig) {
    //     return
    //   }
    //   const body = {
    //     site: this.daoName
    //       .toLowerCase()
    //       .split(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\s+]/)
    //       .filter((i) => i && i !== ' ')
    //       .join('-'),
    //     config,
    //     hash,
    //     sig,
    //     expectedAddress: currentAddress,
    //   }
    //   // Save the config to db, this is the same as updateConfig in the admin sections.
    //   const res = await fetch('/setConfig', {
    //     method: 'POST',
    //     body: JSON.stringify(body),
    //   })
    //   const isConfigSet = res.ok
    //   if (isConfigSet) {
    //     this.dbSetStatus = 'successful'
    //   } else {
    //     this.dbSetStatus = 'failed'
    //   }
    //   if (isConfigSet) {
    //     const host = window.location.host
    //     window.location.href = `https://${body.site}.${host}/setup/homepage`
    //   }
    // },
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
  <div class="grid justify-center">
    <section class="my-32 grid gap-8 text-center">
      <h1 class="text-5xl font-bold">It All Starts with a Domain</h1>
      <p>You can use your preferred domain for your club.</p>
    </section>

    <div class="grid justify-center gap-32">
      <section>
        <div class="flex items-center gap-4 rounded-md bg-dp-blue-grey-200 p-4">
          <input
            class="rounded-md border-[3px] bg-dp-blue-grey-600 px-8 py-4 font-bold"
            v-model="daoName"
            id="daoname"
            name="daoname"
            placeholder="Enter your DAO name"
            pattern="^[a-z|0-9|-]{3,42}$"
            required
          />
          <span class="ml-1 text-lg font-bold">.clubs.place</span>
        </div>
      </section>

      <section v-if="dbSetStatus !== ''">
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

      <section>
        <HSButton
          @click.prevent="setDb()"
          type="outlined"
          class="w-full rounded-md border-0 bg-native-blue-300 px-8 py-4 font-bold hover:bg-native-blue-400 hover:text-inherit"
          >Continue</HSButton
        >
      </section>
    </div>
  </div>
</template>
