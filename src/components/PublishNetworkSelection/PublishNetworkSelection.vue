<template>
  <!-- Step 2 -->
  <section class="grid items-center justify-start gap-8 md:grid-cols-2">
    <section class="grid gap-3">
      <p class="font-mono text-base font-normal">2/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img
          v-if="networkSelected && networkSelected !== ''"
          alt="Status"
          :src="checkImage"
          class="h-6 w-6"
        />
        <h2 v-bind:class="step2TextClasses">Choose network</h2>
      </section>
      <p class="text-base">What is the different between networks?</p>
    </section>
    <div>
      <section
        class="grid grid-cols-[2fr_1fr] grid-rows-2 items-stretch gap-4 lg:grid-cols-[3fr_1fr_1fr] lg:grid-rows-none"
      >
        <button
          @click="changeNetwork('polygon')"
          class="hs-button is-filled is-large row-span-2 h-full flex-col lg:row-auto"
          v-bind:class="
            !connected
              ? 'opacity-50'
              : networkSelected === ''
              ? ''
              : networkSelected === 'polygon'
              ? 'opacity-50'
              : 'opacity-20'
          "
          :disabled="!connected"
        >
          <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
            Polygon
          </p>
          <p class="font-DMSans text-center text-xs font-medium text-[#FFFFFF]">
            Recommended
          </p>
        </button>
        <button
          @click="changeNetwork('arbitrum')"
          class="hs-button is-filled is-large h-full"
          v-bind:class="
            !connected
              ? 'opacity-50'
              : networkSelected === ''
              ? ''
              : networkSelected === 'arbitrum'
              ? 'opacity-50'
              : 'opacity-20'
          "
          :disabled="!connected"
        >
          <p class="font-DMSans text-center text-xs text-[#FFFFFF]">Arbitrum</p>
        </button>
        <button
          @click="changeNetwork('ethereum')"
          class="hs-button is-filled is-large h-full"
          v-bind:class="
            !connected
              ? 'opacity-50'
              : networkSelected === ''
              ? ''
              : networkSelected === 'ethereum'
              ? 'opacity-50'
              : 'opacity-20'
          "
          :disabled="!connected"
        >
          <p class="font-DMSans text-center text-xs text-[#FFFFFF]">Ethereum</p>
        </button>
      </section>
      <div v-if="showTestnets" class="mt-4">
        <button
          @click="changeNetwork('polygon-mumbai')"
          class="hs-button is-filled is-large col-span-2 h-full"
          v-bind:class="
            !connected
              ? 'opacity-50'
              : networkSelected === ''
              ? ''
              : networkSelected === 'polygon-mumbai'
              ? 'opacity-50'
              : 'opacity-20'
          "
          :disabled="!connected"
        >
          <p class="font-DMSans text-center text-xs text-[#FFFFFF]">
            Polygon Mumbai
          </p>
        </button>
      </div>
    </div>
  </section>

  <!-- Step 3 -->
  <section class="justify-stretch grid items-start gap-8 md:grid-cols-2">
    <section class="grid gap-3">
      <p class="font-mono text-base font-normal">3/</p>
      <section
        class="align-items-center flex items-center justify-items-center gap-3"
      >
        <img
          v-if="membershipSet"
          alt="Status"
          :src="checkImage"
          class="h-6 w-6"
        />
        <h2 v-bind:class="step3TextClasses">Activate</h2>
      </section>
    </section>
    <section class="grid gap-4">
      <section class="flex items-center justify-between">
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img
            alt="Status"
            :src="!!addressFromNiwa ? checkImage : roundedSquareImage"
            class="h-3 w-3"
          />
          <p
            class="font-DMSans text-base font-bold"
            v-bind:class="
              networkSelected === '' || !networkSelected || !connected
                ? 'text-[#3A4158]'
                : 'text-white'
            "
          >
            1
          </p>
        </section>
        <div
          class="ml-4 mr-7 h-0 flex-1 border-[1px]"
          v-bind:class="
            !step3Enabled ||
            networkSelected === '' ||
            !networkSelected ||
            !connected ||
            !!addressFromNiwa
              ? 'border-[#3A4158]'
              : 'border-white'
          "
        ></div>
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img
            alt="Status"
            :src="
              addressFromNiwa && membershipInitialized
                ? checkImage
                : roundedSquareImage
            "
            class="h-3 w-3"
          />
          <p
            class="font-DMSans text-base font-bold"
            v-bind:class="
              networkSelected === '' ||
              !networkSelected ||
              !connected ||
              !addressFromNiwa
                ? 'text-[#3A4158]'
                : 'text-white'
            "
          >
            2
          </p>
        </section>
        <div
          class="ml-4 mr-7 h-0 flex-1 border-[1px]"
          v-bind:class="
            networkSelected === '' ||
            !networkSelected ||
            !connected ||
            !addressFromNiwa ||
            membershipInitialized
              ? 'border-[#3A4158]'
              : 'border-white'
          "
        ></div>
        <section
          class="align-items-center flex items-center justify-items-center gap-2"
        >
          <img
            alt="Status"
            :src="
              addressFromNiwa && membershipInitialized && membershipSet
                ? checkImage
                : roundedSquareImage
            "
            class="h-3 w-3"
          />
          <p
            class="font-DMSans text-base font-bold"
            v-bind:class="
              networkSelected === '' ||
              !networkSelected ||
              !connected ||
              !membershipInitialized
                ? 'text-[#3A4158]'
                : 'text-white'
            "
          >
            3
          </p>
        </section>
      </section>
      <button
        @click="
          !addressFromNiwa || addressFromNiwa === ''
            ? openNiwa(link)
            : !membershipInitialized
            ? initializeMemberships()
            : setMemberships()
        "
        class="hs-button is-filled is-large"
        v-bind:class="!step3Enabled ? 'opacity-50' : ''"
        :disabled="!step3Enabled"
      >
        <p class="font-DMSans text-center text-base font-bold text-[#FFFFFF]">
          {{ step3InterStepButtonText }}
        </p>
      </button>
      <p class="font-DMSans text-base font-normal text-white">
        {{ step3InterStepSubInfo }}
      </p>
      <p
        v-if="!category || !membershipsPluginOptions?.length"
        class="font-DMSans rounded bg-danger-300 px-4 py-2 text-base font-normal text-white"
      >
        Complete Basic info, Design, Memberships before activation.
      </p>
    </section>
  </section>
</template>

<script lang="ts">
import { providers } from 'ethers'
import type Web3Modal from 'web3modal'
import { PropType, defineComponent } from '@vue/runtime-core'
import { clientsSTokens } from '@devprotocol/dev-kit/agent'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { BaseProvider } from '@ethersproject/providers'
import {
  address,
  callSimpleCollections,
} from '@plugins/memberships/utils/simpleCollections'
import { Image } from '@plugins/memberships/utils/types/setImageArg'
import { keccak256 } from '@ethersproject/keccak256'
import { parseUnits } from '@ethersproject/units'
import { Membership } from '@plugins/memberships'
import BigNumber from 'bignumber.js'
import {
  ClubsConfiguration,
  ClubsEvents,
  setConfig,
} from '@devprotocol/clubs-core'
import {
  buildConfig,
  onMountClient,
  onUpdatedConfiguration,
} from '@devprotocol/clubs-core/events'

type Data = {
  networkSelected: String
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
  popupWindow: Window | null
  addressFromNiwa: String
  provider?: BaseProvider | null
  membershipInitialized: boolean
  membershipSet: boolean
  currentWalletAddress: string
}

export default defineComponent({
  name: 'PublishNetworkSelection',
  props: {
    checkImage: String,
    roundedSquareImage: String,
    category: String,
    membershipsPluginOptions: Array<Membership>,
    config: {
      type: Object as PropType<ClubsConfiguration>,
      required: true,
    },
    showTestnets: Boolean,
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      networkSelected: '',
      connected: false,
      popupWindow: null as Window | null,
      addressFromNiwa: '',
      provider: null as BaseProvider | null,
      membershipInitialized: false,
      membershipSet: false,
      currentWalletAddress: '',
    }
  },
  computed: {
    buttonClasses() {
      const classes =
        'w-full rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8'

      return this.connected ? classes + ' opacity-50' : classes
    },
    step2TextClasses() {
      const classes = 'font-title text-2xl font-bold'
      return this.connected
        ? this.networkSelected === '' || !this.networkSelected
          ? classes
          : classes + ' line-through opacity-50'
        : classes
    },
    step3TextClasses() {
      const classes = 'font-title text-2xl font-bold'

      return !this.connected ||
        this.networkSelected === '' ||
        !this.networkSelected
        ? classes + ' opacity-50'
        : this.addressFromNiwa &&
          this.membershipInitialized &&
          this.membershipSet
        ? classes + ' line-through opacity-50'
        : classes
    },
    link() {
      return `https://${this.networkSelected.toLowerCase()}.niwa.xyz/tokenize/${this.category?.toLowerCase()}`
    },
    linkOrigin() {
      return new URL(this.link).origin
    },
    step3Enabled() {
      return (
        this.category &&
        this.membershipsPluginOptions?.length &&
        this.connected &&
        this.networkSelected
      )
    },
    step3InterStepButtonText() {
      return !this.connected ||
        !this.networkSelected ||
        this.networkSelected === '' ||
        !this.addressFromNiwa ||
        this.addressFromNiwa === ''
        ? 'Activate'
        : !this.membershipInitialized
        ? 'Initialize your memberships'
        : 'Setup memberships'
    },
    step3InterStepSubInfo() {
      return !this.connected ||
        !this.networkSelected ||
        this.networkSelected === '' ||
        !this.addressFromNiwa ||
        this.addressFromNiwa === ''
        ? 'What is activating?'
        : !this.membershipInitialized
        ? 'Enable a memberships contract to use memberships.'
        : 'Store your memberships to a contract.'
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
        this.currentWalletAddress = currentAddress
      }
      if (provider) {
        this.provider = provider
      }
    })
  },
  methods: {
    getChainId() {
      return this.networkSelected === 'ethereum'
        ? 1
        : this.networkSelected === 'polygon'
        ? 137
        : this.networkSelected === 'polygon-mumbai'
        ? 80001
        : this.networkSelected === 'arbitrum'
        ? 42161
        : this.networkSelected === 'polygon-mumbai'
        ? 80001
        : null
    },

    getRpcUrl() {
      return `https://${
        this.networkSelected === 'ethereum'
          ? 'mainnet.infura.io'
          : this.networkSelected === 'polygon'
          ? 'polygon-mainnet.infura.io'
          : this.networkSelected === 'polygon-mumbai'
          ? 'polygon-mumbai.infura.io'
          : this.networkSelected === 'arbitrum'
          ? 'arbitrum-mainnet.infura.io'
          : 'mainnet.infura.io'
      }/v3/${import.meta.env.PUBLIC_INFURA_KEY}`
    },

    setSigner(provider: providers.Web3Provider) {
      this.connection!().signer.next(provider.getSigner())
    },

    async changeNetwork(network: string) {
      if (!this.connected) return
      this.networkSelected = network
      this.updateConfig()
    },

    openNiwa(link: string) {
      const popupLink = link + '?popup=true'
      this.popupWindow = window.open(
        popupLink,
        'Niwa',
        'popup,width=500,height=700'
      )
      if (this.popupWindow) {
        window.addEventListener('message', this.listenForAddress, false)
      }
    },

    listenForAddress(event: MessageEvent<any>) {
      if (event.origin !== this.linkOrigin) return
      const { address } = event.data
      if (!address) return
      this.addressFromNiwa = address
      this.updateConfig()
    },

    updateConfig() {
      const propertyAddress = this.addressFromNiwa as string
      const rpcUrl = this.getRpcUrl()
      const nextConfig: ClubsConfiguration = {
        ...this.config,
        rpcUrl,
        propertyAddress,
      }
      onUpdatedConfiguration(
        () => {
          if (
            this.config.propertyAddress === propertyAddress &&
            this.config.rpcUrl === rpcUrl
          ) {
            return
          }
          buildConfig()
        },
        { once: true }
      )
      setConfig(nextConfig)
    },

    async initializeMemberships() {
      const currentChainId: number | null = this.getChainId()
      if (!this.provider || !this.addressFromNiwa || !currentChainId) {
        return
      }

      const descriptiorAddress: string | undefined = address.find(
        (address) => address.chainId === currentChainId
      )?.address
      if (!descriptiorAddress) {
        return
      }

      const [l1, l2] = await clientsSTokens(this.provider as BaseProvider)
      const tx = await (l1 || l2)?.setTokenURIDescriptor(
        this.addressFromNiwa.toString(),
        descriptiorAddress
      )
      const response = await tx?.wait(1)

      // const response = { status: true }
      if (response?.status) {
        this.membershipInitialized = true
      } else {
        this.membershipInitialized = false
      }
    },

    async setMemberships() {
      if (
        !this.provider ||
        !this.addressFromNiwa ||
        !this.membershipInitialized
      ) {
        return
      }

      const propertyAddress = this.addressFromNiwa.toString()
      const images: Image[] =
        this.membershipsPluginOptions?.map((opt) => ({
          src: opt.imageSrc,
          requiredETHAmount: parseUnits(String(opt.price)).toString(),
          requiredETHFee: opt.fee?.percentage
            ? parseUnits(
                new BigNumber(opt.price).times(opt.fee.percentage).toFixed()
              ).toString()
            : 0,
          gateway: this.currentWalletAddress,
        })) || []
      const keys: string[] =
        this.membershipsPluginOptions?.map((opt) => keccak256(opt.payload)) ||
        []

      const tx = await callSimpleCollections(this.provider, 'setImages', [
        propertyAddress,
        images,
        keys,
      ])
      const response = await tx?.wait(1)

      if (response?.status) {
        this.membershipSet = true
        window.location.href = '/admin/overview'
      } else {
        this.membershipSet = false
      }
    },
  },
})
</script>
