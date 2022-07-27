<template>
  <div class="bg-cover bg-center">
    <h3 class="mb-8 font-title text-2xl font-bold">Membership</h3>
    <div
      v-if="memberships.length > 0"
      class="grid gap-8 rounded border border-dp-black-200 md:grid-cols-3"
    >
      <div
        v-for="membership in memberships"
        :key="membership.ownerAddress"
        class="p-4"
      >
        <STokenPositions :stokenID="membership.id" layout="square" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  detectStokensByPropertyAddress,
  getStokenOwnerOf,
} from '@fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'
import STokenPositions from '@components/Members/STokenPositions.vue'
import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
import { positionsOfOwner } from '@fixtures/dev-kit'

// NOTE: It is assumed to be used on a wallet-connected page.
export default {
  data() {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      memberships: [],
      propertyAddress: import.meta.env.PUBLIC_PROPERTY_ADDRESS,
    }
  },
  async mounted() {
    const { provider } = await ReConnectWallet(this.modalProvider)
    this.modalProvider = provider
  },
  async created() {
    const { provider, currentAddress } = await ReConnectWallet(
      this.modalProvider
    )
    this.modalProvider = provider
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
  components: {
    Avator,
    STokenPositions,
  },
}
</script>
