<template>
  <div class="bg-cover bg-center">
    <h3 class="font-title my-8 text-2xl font-bold">Supporters</h3>
    <div v-if="members.length > 0" class="border-dp-black-200 rounded border">
      <ul role="list">
        <li
          v-for="member in members"
          :key="member.ownerAddress"
          class="border-dp-black-200 flex items-center border border-x-0 border-t-0 outline-white first:border-solid last:border-none"
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
} from 'packages/clubs-core/functions/dev-kit'
import Avator from 'packages/clubs-core/presentations/components/vue/Members/Avator.vue'
import STokenPositions from 'packages/clubs-core/presentations/components/vue/Members/STokenPositions.vue'

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
