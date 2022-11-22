<template>
  <div class="bg-cover bg-center">
    <h3 class="my-8 font-title text-2xl font-bold">Supporters</h3>
    <div v-if="members.length > 0" class="rounded border border-dp-black-200">
      <ul role="list">
        <li
          v-for="member in members"
          :key="member.ownerAddress"
          class="flex items-center border border-x-0 border-t-0 border-dp-black-200 outline-white first:border-solid last:border-none"
        >
          <Avator :accountAddress="member.ownerAddress" :displayName="true" />
          <STokenPositions
            class="mx-8"
            :stokenID="member.id"
            :rpcUrl="rpcUrl"
          />
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
} from '@fixtures/dev-kit'
import Avator from '@components/Members/Avator.vue'
import STokenPositions from '@components/Members/STokenPositions.vue'

export default {
  props: {
    propertyAddress: String,
    rpcUrl: String,
  },
  data() {
    return {
      members: [],
    }
  },
  async created() {
    const providerURL = this.rpcUrl
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
