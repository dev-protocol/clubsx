<script lang="ts">
import { defineComponent } from 'vue'
import { utils } from 'ethers'
import { checkMemberships } from '@fixtures/utility'
import type { Membership } from '@plugins/memberships'
import type { PropType } from '@vue/runtime-core'
import type { Web3Provider } from '@ethersproject/providers'

let provider: Web3Provider

type Data = {
  name: string
  body: string
  isMember: boolean
  isInVerification: boolean
  messageSentStatus: 'not-sent' | 'sending' | 'send-successful' | 'send-failed'
}

export default defineComponent({
  props: {
    formId: Number,
    propertyAddress: {
      type: String,
      required: true,
    },
    requiredMemberships: {
      type: Array as PropType<Membership[]>,
      required: true,
    },
    pluginIndex: Number,
    membershipPluginIndex: Number,
  },
  data: () =>
    ({
      name: '',
      body: '',
      isMember: false,
      isInVerification: true,
      messageSentStatus: 'not-sent',
    } as Data),
  async mounted() {
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().provider.subscribe(async (prov) => {
      if (!prov) return

      provider = prov as Web3Provider

      if (!this.requiredMemberships.length) {
        this.isMember = false
        return
      }

      try {
        const isMember = await checkMemberships(
          provider,
          this.propertyAddress,
          this.requiredMemberships
        )
        this.isMember = isMember
      } catch {
        this.isMember = false
      } finally {
        this.isInVerification = false
      }
    })
  },
  methods: {
    async signAndSubmit() {
      if (!this.isMember) {
        // TODO: update error state to show error message
        return
      }

      const splitHostname = window.location.hostname.split('.')
      const site = splitHostname[0]
      const signer = provider.getSigner()
      const formId = this.formId
      const data = {
        name: this.name,
        body: this.body,
      }

      const encodedData = window.btoa(JSON.stringify(data))
      const hash = utils.hashMessage(encodedData)
      const sig = await signer.signMessage(hash)
      if (!sig) {
        return
      }
      const body = {
        site,
        data,
        hash,
        sig,
        formId,
        userAddress: await signer.getAddress(),
        propertyAddress: this.propertyAddress,
        pluginIndex: this.pluginIndex,
        membershipPluginIndex: this.membershipPluginIndex,
      }

      try {
        this.messageSentStatus = 'sending'
        const res = await fetch(`/sites_/[site]/message/sendMessage`, {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const success = res.ok
        this.messageSentStatus = success ? 'send-successful' : 'send-failed'
      } catch (e) {
        this.messageSentStatus = 'send-failed'
      }
    },
  },
})
</script>

<template>
  <section class="mb-10" v-if="messageSentStatus == 'not-sent'">
    <!-- Depending on access logic, show either one -->
    <div
      v-if="isInVerification"
      class="animate-pulse rounded bg-gray-500/60 p-2 text-xl"
    >
      Checking you have access...
    </div>
    <div v-else-if="isMember" class="rounded bg-green-500 p-2">
      <h1 class="text-xl font-bold text-white">You have the access</h1>
    </div>
    <div class="rounded bg-red-500 p-2" v-else>
      <h1 class="text-xl font-bold text-white">You don't have the access</h1>
      <p>By purchasing a membership to any one of them, you gain access.</p>
    </div>
  </section>

  <section class="mb-10" v-if="messageSentStatus !== 'not-sent'">
    <!-- Depending on access logic, show either one -->
    <div
      v-if="messageSentStatus === 'sending'"
      class="grid animate-pulse gap-8 rounded bg-gray-500/60 p-2"
    >
      <p class="text-xl">Sending...</p>
      <div class="grid gap-2">
        <p class="text-sm font-bold">Name</p>
        <p class="text-sm">{{ name }}</p>
        <p class="text-sm font-bold">Message</p>
        <pre class="text-sm">{{ body }}</pre>
      </div>
    </div>
    <div v-if="messageSentStatus == 'send-successful'">
      <h1 class="text-xl font-bold text-green-500">
        Your message has been sent!
      </h1>
    </div>
    <div class="text-red-500" v-else-if="messageSentStatus == 'send-failed'">
      <h1 class="text-xl font-bold">An error occured during sending.</h1>
    </div>
  </section>

  <div class="mb-12 grid gap-8" v-if="messageSentStatus == 'not-sent'">
    <label class="hs-form-field is-filled is-required" for="name">
      <span class="hs-form-field__label">Name</span>
      <input
        class="hs-form-field__input"
        v-model="name"
        id="name"
        name="name"
        placeholder="Your name"
        required
      />
    </label>
    <label class="hs-form-field is-filled is-required" for="name">
      <span class="hs-form-field__label">Message</span>
      <textarea
        class="hs-form-field__input"
        v-model="body"
        id="body"
        name="body"
        required
      />
    </label>
    <button
      @click="signAndSubmit"
      type="submit"
      :class="`hs-button is-filled is-large w-fit ${
        isMember && !isInVerification
          ? 'is-plox'
          : isInVerification
          ? 'animate-pulse'
          : ''
      }`"
      :disabled="!isMember || messageSentStatus === 'sending'"
    >
      Sign and Submit
    </button>
  </div>
</template>
