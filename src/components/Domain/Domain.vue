<script lang="ts">
import HSButton from '@components/Primitives/Hashi/HSButton.vue'
import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
import { ClubsConfiguration, encode } from '@devprotocol/clubs-core'
import { utils } from 'ethers'
import { defaultPlugins } from '@constants/plugins'
import { renderSpotlight } from '@fixtures/ui/renderSpotLight'

type Data = {
  daoName: string
  dbSetStatus: string
  fetching?: boolean
  valid?: boolean
}

export default {
  name: 'AlmostThere',
  components: { HSButton },
  props: {
    containerId: {
      type: String,
      required: true,
    },
  },
  data: () =>
    ({
      daoName: '',
      dbSetStatus: '',
      fetching: undefined,
      valid: undefined,
    } as Data),
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
        window.location.href = `https://${body.site}.${host}/setup/homepage`
      }
    },
    async verifySiteName() {
      if (this.daoName === '') {
        this.valid = undefined
        return
      }
      this.fetching = true
      const res = await fetch(`/api/verifySiteName/${this.daoName}`)
      this.fetching = false
      const successful = res.ok
      this.valid = successful
    },
  },
  mounted() {
    renderSpotlight({ containerId: this.containerId })
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
  <div class="relative grid justify-center p-4 md:p-0">
    <section class="my-16 grid gap-8 text-center md:my-32">
      <h1 class="text-2xl font-bold md:text-5xl">
        It All Starts with a Domain
      </h1>
      <p>You can use your preferred domain for your club.</p>
    </section>

    <div class="grid justify-center gap-16 md:gap-32">
      <section>
        <div
          :class="`relative grid items-center gap-4 rounded-md bg-dp-blue-grey-200 p-4 shadow md:grid-flow-col ${
            fetching
              ? 'animate-pulse cursor-progress'
              : valid === true
              ? 'bg-success-300'
              : valid === false
              ? 'bg-danger-300'
              : ''
          }`"
        >
          <input
            class="rounded-md border-[3px] bg-dp-blue-grey-600 px-8 py-4 font-bold"
            v-model="daoName"
            id="daoname"
            name="daoname"
            placeholder="Enter your DAO name"
            pattern="^[a-z|0-9|-]{3,42}$"
            required
            @keyup="verifySiteName"
          />
          <span class="ml-1 text-lg font-bold">.clubs.place</span>
          <p
            v-if="fetching === false && typeof valid === 'boolean'"
            class="absolute top-[100%] left-0 mt-2 rounded-md bg-white p-2 text-sm"
          >
            <span v-if="valid === true" class="text-success-300"
              >Domain available</span
            >
            <span v-if="valid === false" class="text-danger-300"
              >Domain unavailable</span
            >
          </p>
        </div>
      </section>

      <section>
        <HSButton
          v-if="fetching === false && valid"
          type="outlined"
          class="w-full border-0 bg-native-blue-300 shadow hover:bg-native-blue-400 hover:text-inherit"
          link="/connect"
          >Continue</HSButton
        >
        <HSButton
          v-if="fetching || !valid"
          type="outlined"
          class="w-full cursor-not-allowed border-0 bg-dp-blue-grey-200 text-white shadow hover:bg-dp-blue-grey-200 hover:text-inherit"
          isDisabled="true"
          >Continue</HSButton
        >
      </section>
    </div>
  </div>
</template>
