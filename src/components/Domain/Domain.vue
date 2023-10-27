<script lang="ts" setup>
import { onMounted } from 'vue'
import { renderSpotlight } from '@fixtures/ui/renderSpotLight'
import { CLBButton } from '@devprotocol/clubs-core/ui/vue'
import emailIcon from '@assets/mail-iso-gradient.png'
import walletIcon from '@assets/wallet-iso-gradient.png'
import maticIcon from '@assets/matic.png'

let fetching = false
let daoName = ''
let valid: boolean | undefined
let timer: NodeJS.Timeout

const { namePreset, containerId } = defineProps<{
  namePreset?: string
  containerId: string
}>()

onMounted(() => {
  renderSpotlight({ containerId })
  if (namePreset) {
    daoName = namePreset
    verifySiteName()
  }
})

const verifySiteName = async () => {
  clearTimeout(timer)
  if (daoName === '') {
    valid = undefined
    return
  }
  timer = setTimeout(async () => {
    fetching = true
    const res = await fetch(`/api/verifySiteName/${daoName}`)
    fetching = false
    const successful = res.ok
    valid = successful

    console.log('fetching is: ', fetching)
    console.log('valid is: ', valid)
  }, 300)
}
</script>

<template>
  <div class="relative grid justify-center p-4 md:p-0">
    <section class="my-16 grid gap-8 text-center md:my-32">
      <h1 class="text-2xl font-bold md:text-5xl">
        It All Starts with a Domain
      </h1>
      <p>Give your club a name and take the first step to wow the world.</p>
    </section>

    <div
      class="grid justify-center gap-16 md:gap-32 items-center place-items-center pb-12"
    >
      <div>
        <section class="mb-16 md:mb-32">
          <div
            :class="`relative grid items-center gap-4 rounded-md bg-surface-200 p-4 shadow md:grid-flow-col ${
              fetching
                ? 'animate-pulse cursor-progress'
                : valid === true
                ? 'bg-success-300'
                : valid === false
                ? 'bg-danger-300'
                : ''
            }`"
          >
            <label class="hs-form-field is-filled mb-0">
              <input
                class="hs-form-field__input"
                :value="daoName"
                @input="
                  (evt) =>
                    (daoName =
                      (
                        evt.target as undefined | HTMLInputElement
                      )?.value.toLowerCase() ?? '')
                "
                id="daoname"
                name="daoname"
                placeholder="Enter your DAO name"
                pattern="^[a-z|0-9|-]{3,42}$"
                required
                type="text"
                @keyup="verifySiteName"
                autocapitalize="off"
              />
            </label>
            <span class="ml-1 text-lg font-bold">.clubs.place</span>
            <p
              v-if="fetching === false && typeof valid === 'boolean'"
              class="absolute left-0 top-[100%] mt-2 rounded-md bg-white p-2 text-sm"
            >
              <span v-if="valid === true" class="text-[#30a83d]"
                >Domain available</span
              >
              <span v-if="valid === false" class="text-error-400"
                >Domain unavailable</span
              >
            </p>
          </div>
        </section>

        <section>
          <CLBButton
            v-if="!fetching && valid"
            type="filled large fullwidth native-blue"
            :link="`/connect/${daoName}`"
            >Continue</CLBButton
          >
          <CLBButton
            v-if="fetching || !valid"
            type="filled large fullwidth native-blue"
            :isDisabled="true"
            >Continue</CLBButton
          >
        </section>
      </div>

      <!-- Inspirations Section -->
      <section class="w-full sm:w-3/4 lg:w-1/2">
        <div class="bg-white/[0.2] rounded py-6 px-12">
          <div class="flex flex-col">
            <span class="font-mono mb-4"
              >Tips: Things you'll need for a Club</span
            >

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="flex flex-col items-center">
                <div class="w-16 mb-4">
                  <img :src="emailIcon.src" alt="Email Address" />
                </div>
                <span class="font-mono">Email</span>
                <span class="text-sm"
                  >Save with email address and resume anytime.</span
                >
              </div>

              <div class="flex flex-col items-center">
                <div class="w-16 mb-4">
                  <img :src="walletIcon.src" alt="Wallet" />
                </div>

                <span class="font-mono">Wallet</span>
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  class="text-sm underline"
                  >Use the MetaMask wallet for free.</a
                >
              </div>

              <div class="flex flex-col items-center">
                <div class="w-16 mb-4">
                  <img :src="maticIcon.src" alt="Matic" />
                </div>
                <span class="font-mono">Matic</span>
                <a
                  href="https://wallet.polygon.technology/"
                  target="_blank"
                  class="text-sm underline"
                  >Don't have any? Get some here or on an exchange.</a
                >
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
input[type='text'] {
  text-transform: lowercase;
}
</style>
