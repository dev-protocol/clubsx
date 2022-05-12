<template>
  <div>
    <div ref="nav" class="fixed top-14 lg:sticky lg:top-12">
      <button
        class="rounded-r-full bg-white text-black lg:hidden"
        @click="toggleOpen = !toggleOpen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <nav
        :aria-disabled="toggleOpen"
        :style="{ transform: toggleOpen ? 'translateX(0)' : '' }"
        class="mx-4 grid max-h-[80vh] translate-x-[-100vw] justify-items-center gap-8 overflow-y-scroll rounded border border-stone-50/30 bg-slate-50/[.06] p-8 backdrop-blur-3xl transition-transform duration-100 md:max-h-[90vh] lg:mx-auto lg:translate-x-0"
      >
        <img
          src="/assets/avatar.png"
          alt="avator"
          class="h-auto w-full rounded-full"
          width="220"
          height="220"
        />
        <header class="grid justify-items-center gap-2">
          <h2 class="text-xl font-bold">Temples DAO</h2>
          <p class="flex items-center gap-2 font-c-sans text-xs">
            $TEMPL on
            <img src="/assets/ETH.svg" class="h-[1.8em]" alt="Ethereum" />
          </p>
        </header>
        <aside
          class="grid w-full grid-cols-[1fr_auto] justify-between rounded border border-stone-50/30 font-c-sans"
        >
          <h3 class="border-b border-stone-50/30 p-2 opacity-20">
            Club Allocation
          </h3>
          <p class="border-b border-stone-50/30 p-2 opacity-20">TBD</p>
          <h3 class="p-2 opacity-20">APY for $DEV</h3>
          <p class="p-2 opacity-20">&*%</p>
        </aside>
        <a class="m-2 rounded border p-2 px-4 opacity-20">Join</a>
        <div class="grid w-full gap-6">
          <a class="opacity-20">Perks</a>
          <a class="opacity-20">Updates</a>
          <a class="opacity-20">Vote</a>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import { providers } from 'ethers'
import { toggle } from 'src/fixtures/utility'
import { detectStokensByPropertyAddress } from '../../fixtures/dev-kit'

export default {
  name: 'Sidebar',
  data() {
    return {
      members: 0,
      toggleOpen: false,
    }
  },
  async created() {
    // const providerURL = import.meta.env.PUBLIC_WEB3_PROVIDER_URL
    // const provider = new providers.JsonRpcProvider(providerURL)
    // const propertyAddress = import.meta.env.PUBLIC_PROPERTY_ADDRESS
    // await detectStokensByPropertyAddress(provider, propertyAddress).then(
    //   (res) => {
    //     this.members = res.length
    //   }
    // )
  },
  ...toggle('toggleOpen', 'nav'),
}
</script>
