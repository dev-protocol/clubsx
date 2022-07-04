<template>
  <header class="font-body flex items-center justify-between px-8 py-4">
    <h1>
      <!-- Fetch DAO name from YAML config -->
      <a
        href="/"
        class="font-title py-4 font-bold text-gray-900 dark:text-white"
        >You DAO-Name</a
      >
    </h1>
    <div class="flex items-center gap-4">
      <ConnectButton client:only="vue" />
      <div class="relative" ref="menu">
        <button class="rounded border p-2" @click="toggle">
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
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
        <ul
          v-if="menuIsOpen"
          class="absolute right-0 z-50 mt-2 w-48 rounded border border-slate-800 bg-black p-2 shadow"
        >
          <!-- Links and social media name will fetched through yaml -->
          <li>
            <a
              href="https://stakes.social/"
              class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
              target="_blank"
              rel="norefferer noopener"
              >Social media1</a
            >
          </li>
          <hr class="my-4 border-slate-50/20" />
          <li>
            <a
              href="https://www.youtube.com/user/suiundo/"
              class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
              target="_blank"
              rel="norefferer noopener"
              >Social media2</a
            >
          </li>
          <hr class="my-4 border-slate-50/20" />
          <li>
            <a
              href="https://www.youtube.com/user/suiundo/"
              class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
              target="_blank"
              rel="norefferer noopener"
              >More social media</a
            >
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import ConnectButton from '@clubs/clubs-core/presentations/components/vue/Wallet/ConnectButton.vue'

export default {
  data() {
    return {
      menuIsOpen: false,
    }
  },
  methods: {
    toggle() {
      this.menuIsOpen = !this.menuIsOpen
    },
  },
  components: {
    ConnectButton,
  },
}
</script>
