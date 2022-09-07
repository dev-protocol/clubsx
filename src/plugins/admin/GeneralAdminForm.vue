<template>
  <div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" htmlFor="dao-name">
        DAO Name
        <span class="text-purple-400">*</span>
      </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        v-model="name"
        id="dao-name"
        name="dao-name"
      />
    </div>

    <div class="mb-10 flex flex-col">
      <label class="mb-1" htmlFor="description"> Description </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        v-model="description"
        id="description"
        name="description"
      />
    </div>

    <div class="mb-10 flex flex-col">
      <label class="mb-1" htmlFor="roleHolder">
        Editable Role Holder
        <span class="text-purple-400">*</span>
      </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        v-model="roleHolder"
        id="roleHolder"
        name="roleHolder"
      />
    </div>

    <!-- <div>
      <label htmlFor="roleHolder">Editable Role Holder *</label>
      <input class="bg-[#040B10]" id="roleHolder" name="roleHolder" />
    </div> -->

    <div class="mb-10 flex flex-col">
      <label class="mb-1" htmlFor="twitter"> Twitter Handle </label>
      <input
        class="rounded bg-[#040B10] px-8 py-4"
        v-model="twitterHandle"
        id="twitter"
        name="twitter"
      />
    </div>

    <!-- <div>
      <label htmlFor="twitter">Twitter Handle</label>
      <input class="bg-[#040B10]" v-model="twitter" id="twitter" name="twitter" />
    </div> -->

    <!-- Danger Zone-->
    <div class="rounded-lg border border-2 border-red-500 py-12 px-12">
      <div class="mb-10 flex items-center justify-between">
        <span class="font-title text-lg font-bold">Danger Zone</span>
        <button
          @click="dangerLocked = !dangerLocked"
          class="rounded bg-[#040B10] px-8 py-4"
        >
          <!-- {{dangerLocked === true ? <span>Unlock</span> : (<span>Lock</span>)}} -->
          <span v-if="dangerLocked">Unlock</span>
          <span v-else>Lock</span>
        </button>
      </div>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" htmlFor="network">
          Network
          <span class="text-purple-400">*</span>
        </label>
        <!-- <input
          :disabled="dangerLocked"
          class="rounded bg-[#040B10] px-8 py-4"
          id="network"
          name="network"
        /> -->
        <select
          :class="[dangerLocked ? 'bg-[#1E1E1E]' : 'bg-[#040B10]']"
          class="rounded border border-2 border-[#040B10] px-8 py-4"
          :disabled="dangerLocked"
          v-model="network"
          id="network"
          name="network"
        >
          <option
            v-for="option in networkOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.name }}
          </option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="mb-1" htmlFor="tokenAddress">
          Token Address
          <span class="text-purple-400">*</span>
        </label>
        <input
          :disabled="dangerLocked"
          :class="[dangerLocked ? 'bg-[#1E1E1E]' : 'bg-[#040B10]']"
          class="rounded border border-2 border-[#040B10] px-8 py-4"
          v-model="propertyAddress"
          id="tokenAddress"
          name="tokenAddress"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'

export default {
  name: 'GeneralAdminForm',
  props: {
    name: String,
    description: String,
    twitterHandle: String,
    propertyAddress: String,
  },
  data() {
    const modalProvider = GetModalProvider()
    return {
      modalProvider,
      provider: undefined,
      dangerLocked: true,
      networkOptions: [
        { name: 'Mainnet', value: 'mainnet' },
        { name: 'Polygon', value: 'polygon' },
        { name: 'Arbitrum', value: 'arbitrum' },
        { name: 'Polygon Mumbai', value: 'polygon-mumbai' },
        { name: 'Arbitrum Rinkeby', value: 'arbitrum-rinkeby' },
      ],
    }
  },
  async mounted() {
    const { provider } = await ReConnectWallet(this.modalProvider)
    this.provider = provider
  },
}
</script>
