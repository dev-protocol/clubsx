<template>
  <div class="bg-cover bg-center">
    <h3 class="my-8 text-2xl">Supporters</h3>
    <div v-if="members.length > 0" class="rounded border border-accent">
      <ul role="list">
        <li
          v-for="member in members"
          :key="member.ownerAddress"
          class="flex items-center border border-x-0 border-t-0 border-accent outline-white first:border-solid last:border-none"
        >
          <Avator :accountAddress="member.ownerAddress" :displayName="true" />
          <STokenPositions class="mx-8" :stokenID="member.id" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { providers } from 'ethers'
import {
  detectStokensByPropertyAddress,
  getStokenOwnerOf,
} from '../../fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'
import STokenPositions from '@components/Members/STokenPositions.vue'

export default {
  data() {
    return {
      members: [],
      propertyAddress: import.meta.env.PUBLIC_PROPERTY_ADDRESS,
    }
  },
  async created() {
    const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    const provider = new providers.JsonRpcProvider(providerURL)
    const stokenIDs = await detectStokensByPropertyAddress(
      provider,
      this.propertyAddress
    )
    const ret = await Promise.all(
      stokenIDs.map(async (stokenID) => {
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
    this.members = ret
  },
  components: {
    Avator,
    STokenPositions,
  },
}
</script>
