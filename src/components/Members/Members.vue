<template>
  <div class="mx-4 bg-cover bg-center">
    <h2 class="text-3xl">Members</h2>
    <div class="rounded border">
      <ul role="list">
        <li
          v-for="member in members"
          :key="member.ownerAddress"
          class="flex border border-x-0 border-t-0 outline-white first:border-solid last:border-none"
        >
          <Avator :accountAddress="member.ownerAddress" :displayName="true" />
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
} from '../../fixtures/devkit'
import Avator from './Avator.vue'

export default {
  data() {
    return {
      members: [],
      creators: [],
    }
  },
  async created() {
    const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    const provider = new providers.JsonRpcProvider(providerURL)
    const propertyAddress = import.meta.env.PUBLIC_PROPERTY_ADDRESS
    const stokenIDs = await detectStokensByPropertyAddress(
      provider,
      propertyAddress
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
    console.log(ret)
    this.members = ret
  },
  components: {
    Avator,
  },
}
</script>
