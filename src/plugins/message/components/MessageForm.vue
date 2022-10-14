<script lang="ts">
import { defineComponent } from 'vue'
import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
import { utils } from 'ethers'
import { GatedMessage } from '../types'
import { encode } from '@devprotocol/clubs-core'
import { checkMemberships } from '@fixtures/utility'
import forms from '../forms.json'

export default defineComponent({
  props: {
    formId: Number,
    propertyAddress: String,
  },
  data: () => ({
    fullname: '',
    addressLine1: '',
    addressLine2: '',
    zipCode: '',
    city: '',
    country: '',
    isMember: false,
    messageSentStatus: 'not-sent',
  }),
  async beforeMount() {
    const modalProvider = GetModalProvider()
    const { provider, currentAddress } = await ReConnectWallet(modalProvider)
    if (!currentAddress || !provider) {
      return
    }

    const formData = forms.find((element) => element.id === Number(this.formId))
    if (!formData) {
      this.isMember = false
      return
    }

    try {
      const isMember = await checkMemberships(
        provider,
        this.propertyAddress,
        formData.requiredMemberships
      )
      this.isMember = isMember
    } catch {
      this.isMember = false
    }
  },
  methods: {
    async signAndSubmit() {
      // if (!this.isMember) {
      //   // TODO: update error state to show error message
      //   return
      // }

      const splitHostname = window.location.hostname.split('.')
      const site = splitHostname[0]

      const modalProvider = GetModalProvider()
      const { provider, currentAddress } = await ReConnectWallet(modalProvider)
      if (!currentAddress || !provider) {
        return
      }

      const signer = provider.getSigner()
      const data = {
        fullname: this.fullname,
        addressLine1: this.addressLine1,
        addressLine2: this.addressLine2,
        zipCode: this.zipCode,
        city: this.city,
        country: this.country,
        formId: this.formId,
      }

      const encodedData = encode(data)
      const hash = await utils.hashMessage(encodedData)
      const sig = await signer.signMessage(hash)
      if (!sig) {
        return
      }
      console.log(signer, await signer.getAddress())
      const body = {
        site,
        data,
        hash,
        sig,
        userAddress: await signer.getAddress(),
        propertyAddress: this.propertyAddress
      }

      try {
        const res = await fetch(`/sites_/[site]/message/sendMessage`, {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const success = res.ok
        this.messageSentStatus = success ? 'send-successful' : 'send-failed'
      } catch (e) {
        console.log("ERROR", e);
        this.messageSentStatus = 'send-failed'
      }
    },
  },
})
</script>

<template>
  <section class="mb-10" v-if="messageSentStatus == 'not-sent'">
    <!-- Depending on access logic, show either one -->
    <div v-if="isMember">
      <h1 class="font-title text-xl font-black text-green-500">
        You have the access
      </h1>
    </div>
    <div class="text-red-500" v-else>
      <h1 class="font-title text-xl font-black">You don't have the access</h1>
      <p>By purchasing a membership to any one of them, you gain access.</p>
    </div>
  </section>

  <section class="mb-10" v-if="messageSentStatus !== 'not-sent'">
    <!-- Depending on access logic, show either one -->
    <div v-if="messageSentStatus == 'send-successful'">
      <h1 class="font-title text-xl font-black text-green-500">
        Your message has been sent!
      </h1>
    </div>
    <div class="text-red-500" v-else-if="messageSentStatus == 'send-failed'">
      <h1 class="font-title text-xl font-black">
        An error occured during sending.
      </h1>
    </div>
  </section>

  <div class="mb-12" v-if="messageSentStatus == 'not-sent'">
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="fullname">
        Full Name <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="fullname"
        id="fullname"
        name="fullname"
        placeholder="Full name"
        required
      />
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="addressLine1">
        Address Line 1 <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="addressLine1"
        id="addressLine1"
        name="addressLine1"
        placeholder="Address Line 1"
        required
      />
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="addressLine2">
        Address Line 2 <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="addressLine2"
        id="addressLine2"
        name="addressLine2"
        placeholder="Address Line 2"
        required
      />
    </div>
    <div class="mb-10 grid grid-cols-2 gap-x-4">
      <div class="flex flex-col">
        <label class="mb-1" for="zipCode">
          Zip / Postal Code <span class="text-red-500">*</span></label
        >
        <input
          class="rounded bg-gray-700 px-8 py-4"
          v-model="zipCode"
          id="zipCode"
          name="zipCode"
          placeholder="Zip / Postal Code"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-1" for="city">
          City <span class="text-red-500">*</span></label
        >
        <input
          class="rounded bg-gray-700 px-8 py-4"
          v-model="city"
          id="city"
          name="city"
          placeholder="City"
          required
        />
      </div>
    </div>
    <div class="mb-10 flex flex-col">
      <label class="mb-1" for="country">
        Country <span class="text-red-500">*</span></label
      >
      <input
        class="rounded bg-gray-700 px-8 py-4"
        v-model="country"
        id="country"
        name="country"
        placeholder="Country"
        required
      />
    </div>
    <button
      @click="signAndSubmit"
      type="submit"
      class="border-[##171717] rounded bg-[#D500E6] py-2 px-7"
    >
      Sign and Submit
    </button>
  </div>
</template>
