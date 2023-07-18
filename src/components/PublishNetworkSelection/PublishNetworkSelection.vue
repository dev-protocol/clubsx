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
      <p class="text-base">What is the difference between networks?</p>
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
              : ''
          "
          :disabled="
            !connected ||
            addressFromNiwaOrConfigIsValid ||
            isTokenizing ||
            initMbmershipTxnProcessing ||
            setupMemberhipTxnProcessing ||
            isRemovingDraftStatus ||
            membershipInitialized ||
            membershipSet ||
            clubPublished
          "
        >
          <span class="hs-button__label"> Polygon </span>
          <span class="text-center text-xs"> Recommended </span>
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
              : ''
          "
          title="Currently, Clubs is not supporting this chain"
          :disabled="
            true ||
            !connected ||
            addressFromNiwaOrConfigIsValid ||
            isTokenizing ||
            initMbmershipTxnProcessing ||
            setupMemberhipTxnProcessing ||
            isRemovingDraftStatus ||
            membershipInitialized ||
            membershipSet ||
            clubPublished
          "
        >
          <span class="hs-button__label">Arbitrum</span>
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
              : ''
          "
          title="Currently, Clubs is not supporting this chain"
          :disabled="
            true ||
            !connected ||
            addressFromNiwaOrConfigIsValid ||
            isTokenizing ||
            initMbmershipTxnProcessing ||
            setupMemberhipTxnProcessing ||
            isRemovingDraftStatus ||
            membershipInitialized ||
            membershipSet ||
            clubPublished
          "
        >
          <span class="hs-button__label">Ethereum</span>
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
              : ''
          "
          :disabled="
            !connected ||
            addressFromNiwaOrConfigIsValid ||
            isTokenizing ||
            initMbmershipTxnProcessing ||
            setupMemberhipTxnProcessing ||
            isRemovingDraftStatus ||
            membershipInitialized ||
            membershipSet ||
            clubPublished
          "
        >
          <span class="hs-button__label"> Polygon Mumbai </span>
        </button>
      </div>
    </div>
  </section>

  <!-- Step 3 -->
  <section class="grid items-start justify-stretch gap-8 md:grid-cols-2">
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
            :src="
              addressFromNiwaOrConfigIsValid ? checkImage : roundedSquareImage
            "
            class="h-3 w-3"
            v-bind:class="isTokenizing ? 'animate-pulse' : ''"
          />
          <p
            class="font-DMSans text-base font-bold"
            v-bind:class="
              networkSelected === '' || !networkSelected || !connected
                ? 'text-[#3A4158]'
                : isTokenizing
                ? 'animate-pulse text-white'
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
            !!addressFromNiwaOrConfigIsValid
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
              addressFromNiwaOrConfigIsValid && membershipInitialized
                ? checkImage
                : roundedSquareImage
            "
            class="h-3 w-3"
            v-bind:class="initMbmershipTxnProcessing ? ' animate-pulse' : ''"
          />
          <p
            class="font-DMSans text-base font-bold"
            v-bind:class="
              networkSelected === '' ||
              !networkSelected ||
              !connected ||
              !addressFromNiwaOrConfigIsValid
                ? 'text-[#3A4158]'
                : initMbmershipTxnProcessing
                ? ' animate-pulse text-white'
                : ' text-white'
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
            !addressFromNiwaOrConfigIsValid ||
            !membershipInitialized
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
              addressFromNiwaOrConfigIsValid &&
              membershipInitialized &&
              membershipSet
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
                : setupMemberhipTxnProcessing
                ? ' animate-pulse text-white'
                : ' text-white'
            "
          >
            3
          </p>
        </section>
      </section>
      <button
        @click="
          !addressFromNiwaOrConfigIsValid
            ? openNiwa(link)
            : !membershipInitialized
            ? initializeMemberships()
            : !membershipSet
            ? setMemberships()
            : updateConfig(true)
        "
        class="hs-button is-filled is-large"
        v-bind:class="
          !step3Enabled
            ? 'opacity-50'
            : isTokenizing ||
              initMbmershipTxnProcessing ||
              setupMemberhipTxnProcessing ||
              isRemovingDraftStatus
            ? ' animate-pulse'
            : ''
        "
        :disabled="
          !step3Enabled ||
          isTokenizing ||
          initMbmershipTxnProcessing ||
          setupMemberhipTxnProcessing ||
          isRemovingDraftStatus ||
          clubPublished
        "
      >
        <span class="hs-button__label">
          {{ step3InterStepButtonText }}
        </span>
      </button>
      <p class="font-DMSans text-base font-normal text-white">
        {{ step3InterStepSubInfo }}
      </p>
      <p
        v-if="!category || !membershipsPluginOptions?.length"
        class="font-DMSans bg-danger-300 rounded px-4 py-2 text-base font-normal text-white"
      >
        Complete Basic info, Design, Memberships before activation.
      </p>
    </section>
  </section>
</template>

<script lang="ts">
import { ContractRunner, Signer, ZeroAddress } from 'ethers'
import type Web3Modal from 'web3modal'
import { PropType, defineComponent } from '@vue/runtime-core'
import { clientsSTokens } from '@devprotocol/dev-kit/agent'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import {
  address,
  callSimpleCollections,
} from '@plugins/memberships/utils/simpleCollections'
import type { Image } from '@plugins/memberships/utils/types/setImageArg'
import { keccak256 } from '@ethersproject/keccak256'
import { parseUnits } from '@ethersproject/units'
import type { Membership } from '@plugins/memberships'
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
import type { DraftOptions } from '@constants/draft'

type Data = {
  networkSelected: String
  connected: boolean
  modalProvider?: Web3Modal
  connection?: typeof Connection
  popupWindow: Window | null
  addressFromNiwa: String
  membershipInitialized: boolean
  membershipSet: boolean
  currentWalletAddress: string
  isTokenizing: boolean
  tokenizingStatusMsg: string
  initMbmershipTxnProcessing: boolean
  initMembershipTxnStatusMsg: string
  setupMemberhipTxnProcessing: boolean
  setupMbmershipTxnStatusMsg: string
  removingDraftStatusMsg: string
  isRemovingDraftStatus: boolean
  clubPublished: boolean
}

let provider: ContractRunner | undefined
let signer: Signer | undefined

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
    allowAccess: Boolean,
    site: {
      type: String,
      required: true,
    },
  },
  data(): Data {
    return {
      modalProvider: undefined,
      connection: undefined,
      networkSelected:
        !this.config.propertyAddress ||
        this.config.propertyAddress === ZeroAddress
          ? ''
          : this.getNetworkFromChainId(this.config.chainId),
      connected: false,
      popupWindow: null as Window | null,
      addressFromNiwa:
        !this.config.propertyAddress ||
        this.config.propertyAddress === ZeroAddress
          ? ''
          : this.config.propertyAddress,
      membershipInitialized: false,
      membershipSet: false,
      currentWalletAddress: '',
      isTokenizing: false,
      initMbmershipTxnProcessing: false,
      tokenizingStatusMsg: 'Activate',
      initMembershipTxnStatusMsg: 'Initialize your memberships',
      setupMemberhipTxnProcessing: false,
      setupMbmershipTxnStatusMsg: 'Setup memberships',
      removingDraftStatusMsg: 'Publish your club',
      isRemovingDraftStatus: false,
      clubPublished: false,
    }
  },
  computed: {
    addressFromNiwaOrConfigIsValid(): boolean {
      const address = Boolean(this.addressFromNiwa)
        ? this.addressFromNiwa
        : this.config.propertyAddress
      return !!address && address !== ZeroAddress
    },
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
        : classes + ' opacity-50'
    },
    step3TextClasses() {
      const classes = 'font-title text-2xl font-bold'

      return !this.connected ||
        this.networkSelected === '' ||
        !this.networkSelected
        ? classes + ' opacity-50'
        : this.addressFromNiwaOrConfigIsValid &&
          this.membershipInitialized &&
          this.membershipSet
        ? classes + ' line-through opacity-50'
        : classes
    },
    baseTokenizationLink() {
      return `https://niwa.xyz/tokenize/${this.category?.toLowerCase()}`
    },
    link() {
      const url = new URL(this.baseTokenizationLink)
      url.host = `${this.networkSelected.toLowerCase()}.${url.host}`
      const urlParams = new URLSearchParams(url.search)
      urlParams.set('popup', 'true')
      this.allowAccess && urlParams.set('allowAccess', 'true')
      url.search = urlParams.toString()
      return url.toString()
    },
    linkOrigin() {
      return new URL(this.link).origin as string
    },
    baseTokenizationLinkOrigin() {
      return new URL(this.baseTokenizationLink).origin
    },
    step3Enabled() {
      return (
        this.category &&
        this.membershipsPluginOptions?.length &&
        this.connected &&
        this.networkSelected
      )
    },
    addressFromNiwaOrConfig() {
      return this.config.propertyAddress &&
        this.config.propertyAddress != ZeroAddress
        ? this.config.propertyAddress
        : this.addressFromNiwa
    },
    step3InterStepButtonText() {
      return !this.addressFromNiwaOrConfigIsValid
        ? this.tokenizingStatusMsg
        : !this.membershipInitialized
        ? this.initMembershipTxnStatusMsg
        : !this.membershipSet
        ? this.setupMbmershipTxnStatusMsg
        : this.removingDraftStatusMsg
    },
    step3InterStepSubInfo() {
      return !this.addressFromNiwaOrConfigIsValid
        ? 'What is activating?'
        : !this.membershipInitialized
        ? 'Enable a memberships contract to use memberships.'
        : 'Store your memberships to a contract.'
    },
    async initMembershipStatus() {
      return (await this.getStep2CompletionStatusAndMessages())
        .membershipInitialized
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
        await this.updateStep2CompletionStatus()
      })
      connection().account.subscribe(async (acc) => {
        if (acc) {
          this.currentWalletAddress = acc
          this.connected = true
          await this.updateStep2CompletionStatus()
        }
      })
      connection().signer.subscribe(async (sig) => {
        signer = sig
        await this.updateStep2CompletionStatus()
      })
    })
  },
  methods: {
    async getStep2CompletionStatusAndMessages() {
      let initMbmershipTxnProcessing = true
      let initMembershipTxnStatusMsg = 'Fetching initialization details...'
      let membershipInitialized = false

      const currentChainId: number | null = this.getChainId()
      if (!provider || !this.addressFromNiwaOrConfig || !currentChainId) {
        initMbmershipTxnProcessing = false
        initMembershipTxnStatusMsg = 'Initialize your memberships'
        membershipInitialized = false
        return {
          initMbmershipTxnProcessing,
          initMembershipTxnStatusMsg,
          membershipInitialized,
        }
      }

      const [l1, l2] = await clientsSTokens(provider)
      const propertyAddress = Boolean(this.addressFromNiwa)
        ? (this.addressFromNiwa as string)
        : (this.addressFromNiwaOrConfig as string)

      const descriptiorAddress: string | undefined = address.find(
        (address) => address.chainId === currentChainId,
      )?.address
      if (!descriptiorAddress) {
        initMbmershipTxnProcessing = false
        initMembershipTxnStatusMsg = 'Initialize your memberships'
        membershipInitialized = false
        return {
          initMbmershipTxnProcessing,
          initMembershipTxnStatusMsg,
          membershipInitialized,
        }
      }

      const contract = (l1 || l2)?.contract()
      const descriptorAddressInContract: string = await contract?.descriptorOf(
        propertyAddress,
      )
      initMbmershipTxnProcessing = false
      membershipInitialized =
        descriptorAddressInContract?.toLowerCase() ===
        descriptiorAddress?.toLocaleLowerCase()
      initMembershipTxnStatusMsg = membershipInitialized
        ? 'Membership initialized, fetching setup details...'
        : 'Initialize your memberships'

      return {
        initMbmershipTxnProcessing,
        initMembershipTxnStatusMsg,
        membershipInitialized,
      }
    },

    async updateStep2CompletionStatus() {
      this.membershipInitialized = false
      this.initMbmershipTxnProcessing = true
      this.initMembershipTxnStatusMsg = 'Fetching initialization details...'

      const {
        initMbmershipTxnProcessing,
        initMembershipTxnStatusMsg,
        membershipInitialized,
      } = await this.getStep2CompletionStatusAndMessages()
      this.initMbmershipTxnProcessing = initMbmershipTxnProcessing
      this.membershipInitialized = membershipInitialized
      this.initMembershipTxnStatusMsg = initMembershipTxnStatusMsg
    },

    getNetworkFromChainId(chainId: number | null) {
      return chainId === 1
        ? 'ethereum'
        : chainId === 137
        ? 'polygon'
        : chainId === 80001
        ? 'polygon-mumbai'
        : chainId === 42161
        ? 'arbitrum'
        : chainId === 80001
        ? 'polygon-mumbai'
        : ''
    },

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

    async changeNetwork(network: string) {
      if (
        !this.connected ||
        this.isTokenizing ||
        this.addressFromNiwaOrConfigIsValid ||
        this.membershipInitialized ||
        this.membershipSet ||
        this.initMbmershipTxnProcessing ||
        this.setupMemberhipTxnProcessing
      )
        return
      this.networkSelected = network
      this.updateConfig(false)
    },

    openNiwa(link: string) {
      if (this.isTokenizing) return

      const popupLink = link
      this.popupWindow = window.open(
        popupLink,
        'Niwa',
        'popup,width=500,height=700',
      )
      if (this.popupWindow) {
        this.isTokenizing = true
        this.tokenizingStatusMsg = 'Activation in process...'
        window.addEventListener('message', this.listenForAddress, false)
      } else {
        this.isTokenizing = false
        this.tokenizingStatusMsg = 'Activating failed, try again!'
      }
    },

    listenForAddress(event: MessageEvent<any>) {
      if (
        event.origin !== this.linkOrigin &&
        event.origin !== this.baseTokenizationLinkOrigin
      )
        return

      const { address } = event.data
      if (!address) {
        this.isTokenizing = false
        this.tokenizingStatusMsg = 'Activation failed, try again!'
        return
      }

      try {
        this.addressFromNiwa = address
        this.updateConfig(false)
        this.tokenizingStatusMsg = 'Activated, setting up initialization..'
      } catch (error) {
        this.tokenizingStatusMsg = 'Activated failed, try again!'
      } finally {
        this.isTokenizing = false
      }
    },

    onRemovingDraft() {
      return document.body.addEventListener(
        ClubsEvents.FinishConfiguration,
        (ev: any) => {
          this.isRemovingDraftStatus = true
          this.removingDraftStatusMsg = 'Finalizing publishing...'

          if (typeof ev.detail.success === 'boolean') {
            if (ev.detail.success) {
              this.clubPublished = true
              this.removingDraftStatusMsg =
                'Your Club is published, loading overview...'
              window.location.href = new URL(
                '/admin/overview',
                `${location.protocol}//${this.site}.${location.host}`,
              ).toString()
            } else {
              this.clubPublished = false
              this.removingDraftStatusMsg = 'Publishing failed, try again!'
            }
          }

          this.isRemovingDraftStatus = false
        },
      )
    },

    updateConfig(disableDraft: boolean = false) {
      const propertyAddress = Boolean(this.addressFromNiwa)
        ? (this.addressFromNiwa as string)
        : (this.addressFromNiwaOrConfig as string)
      const rpcUrl = this.getRpcUrl()
      const chainId = this.getChainId()
      if (!chainId) return

      const __draftOptions: DraftOptions | undefined =
        this.config?.options?.find((op) => op.key === '__draft') as DraftOptions
      if (!__draftOptions) return
      const __updatedDraftOptions: DraftOptions = disableDraft
        ? {
            ...__draftOptions,
            value: { ...__draftOptions.value, isInDraft: false },
          }
        : __draftOptions
      if (!__updatedDraftOptions) return

      const nextConfig: ClubsConfiguration = {
        ...this.config,
        rpcUrl,
        chainId,
        propertyAddress,
        options: [
          ...(this.config.options
            ? [
                ...this.config.options.filter((op) => op.key !== '__draft'),
                __updatedDraftOptions,
              ]
            : []),
        ],
      }

      onUpdatedConfiguration(
        () => {
          if (
            this.config.propertyAddress === propertyAddress &&
            this.config.rpcUrl === rpcUrl &&
            this.config.chainId === chainId &&
            !disableDraft // Since when disabling the draft all the config properties will be same.
          ) {
            return
          }

          try {
            if (disableDraft) {
              this.isRemovingDraftStatus = true
              this.removingDraftStatusMsg = 'Publishing your club...'
            }
            buildConfig()
          } catch (error) {
            if (disableDraft) {
              this.clubPublished = false
              this.removingDraftStatusMsg = 'Publish failed, try again!'
              this.isRemovingDraftStatus = false
            }
          }
        },
        { once: true },
      )

      if (disableDraft) {
        this.isRemovingDraftStatus = true
        this.removingDraftStatusMsg = 'Preparing publishing your club...'
        this.onRemovingDraft() // Attach the onFinishConfigurationListener to update states.
      }
      setConfig(nextConfig)
    },

    async initializeMemberships() {
      if (this.initMbmershipTxnProcessing) return

      this.initMbmershipTxnProcessing = true
      this.initMembershipTxnStatusMsg = 'Initializing memberhips...'

      const currentChainId: number | null = this.getChainId()
      if (
        !provider ||
        !this.addressFromNiwaOrConfigIsValid ||
        !currentChainId ||
        !signer
      ) {
        this.initMbmershipTxnProcessing = false
        this.initMembershipTxnStatusMsg = 'Initialization failed, try again!'
        return
      }

      const descriptiorAddress: string | undefined = address.find(
        (address) => address.chainId === currentChainId,
      )?.address
      if (!descriptiorAddress) {
        this.initMbmershipTxnProcessing = false
        this.initMembershipTxnStatusMsg = 'Initialization failed, try again!'
        return
      }

      try {
        const [l1, l2] = await clientsSTokens(provider)
        const propertyAddress = Boolean(this.addressFromNiwa)
          ? (this.addressFromNiwa as string)
          : (this.addressFromNiwaOrConfig as string)

        this.initMembershipTxnStatusMsg =
          'Awaiting transaction confirmation on wallet...'

        const l = l1 || l2
        if (!l) {
          this.initMbmershipTxnProcessing = false
          this.initMembershipTxnStatusMsg = 'Initialization failed, try again!'
          return
        }

        const tx = await l.setTokenURIDescriptor(
          propertyAddress,
          descriptiorAddress,
        )

        this.initMembershipTxnStatusMsg =
          'Transaction processing on the blockchain...'
        const response = await tx?.wait(1)

        if (response?.status) {
          this.initMembershipTxnStatusMsg = 'Initialization done.'
          this.membershipInitialized = true
        } else {
          this.initMembershipTxnStatusMsg = 'Initialization failed, try again!'
          this.membershipInitialized = false
        }
      } catch (error) {
        this.membershipInitialized = false
        this.initMembershipTxnStatusMsg = 'Initialization failed, try again!'
      } finally {
        this.initMbmershipTxnProcessing = false
      }
    },

    async setMemberships() {
      if (this.setupMemberhipTxnProcessing) return

      this.setupMemberhipTxnProcessing = true
      this.setupMbmershipTxnStatusMsg = 'Setting up memberships...'

      if (
        !signer ||
        !this.addressFromNiwaOrConfigIsValid ||
        !this.membershipInitialized
      ) {
        this.setupMemberhipTxnProcessing = false
        this.setupMbmershipTxnStatusMsg = 'Setup failed, try again!'
        return
      }

      try {
        const propertyAddress = Boolean(this.addressFromNiwa)
          ? (this.addressFromNiwa as string)
          : (this.addressFromNiwaOrConfig as string)
        const images: Image[] =
          this.membershipsPluginOptions?.map((opt) => ({
            src: opt.imageSrc,
            name: opt.name,
            description: opt.description,
            requiredETHAmount: parseUnits(String(opt.price)).toString(),
            requiredETHFee: opt.fee?.percentage
              ? parseUnits(
                  new BigNumber(opt.price).times(opt.fee.percentage).toFixed(),
                ).toString()
              : 0,
            gateway: opt.fee?.beneficiary ?? ZeroAddress,
          })) || []
        const keys: string[] =
          this.membershipsPluginOptions?.map((opt) => keccak256(opt.payload)) ||
          []

        this.setupMbmershipTxnStatusMsg =
          'Awaiting transaction confirmation on wallet...'
        const tx = await callSimpleCollections(signer, 'setImages', [
          propertyAddress,
          images,
          keys,
        ])

        this.setupMbmershipTxnStatusMsg =
          'Transaction processing on the blockchain...'
        const response = await tx?.wait(1)

        if (response?.status) {
          this.membershipSet = true
          this.setupMbmershipTxnStatusMsg = 'Memberships setup complete'
          // Disable the draft.
          this.updateConfig(true)
        } else {
          this.setupMbmershipTxnStatusMsg = 'Setup failed, try again!'
          this.membershipSet = false
        }
      } catch (error) {
        this.membershipSet = false
        this.setupMbmershipTxnStatusMsg = 'Setup failed, try again!'
      } finally {
        this.setupMemberhipTxnProcessing = false
      }
    },
  },
})
</script>
