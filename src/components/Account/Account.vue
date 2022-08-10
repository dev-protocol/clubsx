<template>
  <div class="bg-cover bg-center">
    <h3 class="mb-8 font-title text-2xl font-bold">Account</h3>
    <div class="mb-8 flex">
      <div>Your account is connecting with wallet:</div>
      <div class="ml-1">
        {{ truncateCurrentAddress || '-' }}
      </div>
    </div>
    <button
      v-if="truncateCurrentAddress"
      v-on:click="signout"
      class="rounded-sm border bg-gray-600 p-2 px-4"
    >
      Sign out
    </button>
  </div>
</template>

<script>
import truncateEthAddress from 'truncate-eth-address'
import {
  detectStokensByPropertyAddress,
  getStokenOwnerOf,
  positionsOfOwner,
} from '@fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'
import STokenPositions from '@components/Members/STokenPositions.vue'
import { GetModalProvider, ReConnectWallet, Disconnect } from '@fixtures/wallet'

// NOTE: It is assumed to be used on a wallet-connected page.
export default {
  props: {
    propertyAddress: string
  },
  data() {
    const modalProvider = GetModalProvider()
    return {
      truncateCurrentAddress: '',
      modalProvider,
      provider: undefined,
      memberships: [],
    }
  },
  async mounted() {
    const { provider } = await ReConnectWallet(this.modalProvider)
    this.provider = provider
  },
  async created() {
    const { provider, currentAddress } = await ReConnectWallet(
      this.modalProvider
    )
    this.provider = provider
    this.truncateCurrentAddress = truncateEthAddress(currentAddress)
    const stokenIDs = await detectStokensByPropertyAddress(
      provider,
      this.propertyAddress
    )

    const accountStokenIDs = await positionsOfOwner(provider, currentAddress)

    const membershipStokenIDs = accountStokenIDs.filter((stokenID) =>
      stokenIDs.includes(stokenID)
    )

    const ret = await Promise.all(
      membershipStokenIDs.map(async (stokenID) => {
        return await getStokenOwnerOf(provider, stokenID).then(
          (ownerAddress) => {
            return {
              id: stokenID,
              ownerAddress,
            }
          }
        )
      })
    )
    this.memberships = ret
  },
  methods: {
    signout() {
      console.log('signout', this.modalProvider)
      Disconnect(this.modalProvider)
      window.location.href = '/'
    },
  },
  components: {
    Avator,
    STokenPositions,
  },
}
</script>
