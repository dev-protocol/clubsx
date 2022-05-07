<template>
  <div class="mx-2 mb-auto flex flex-col items-center border px-2 py-8">
    <div class="w-auto items-center lg:mx-20">
      <img
        src="/assets/avator.png"
        alt="avator"
        class="max-h-96 w-auto"
        width="220"
        height="220"
      />
    </div>
    <div>
      <p>D Club</p>
    </div>
    <div class="flex">
      <div class="mr-2">$DCOM on</div>
      <img src="/assets/ETH.svg" alt="ethereum" />
    </div>
    <div>
      <a href="/members">{{ members || '-' }} Members</a>
    </div>
    <div class="m-2 border p-2 px-4">
      <a href="/join">Join</a>
    </div>
    <div>
      <a href="/quests">Quests</a>
    </div>
  </div>
</template>

<script>
import { providers } from 'ethers'
import { detectStokensByPropertyAddress } from '../../fixtures/dev-kit'

export default {
  name: 'Sidebar',
  data() {
    return {
      members: 0,
    }
  },
  async created() {
    const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    const provider = new providers.JsonRpcProvider(providerURL)
    const propertyAddress = import.meta.env.PUBLIC_PROPERTY_ADDRESS
    await detectStokensByPropertyAddress(provider, propertyAddress).then(
      (res) => {
        this.members = res.length
      }
    )
  },
}
</script>
