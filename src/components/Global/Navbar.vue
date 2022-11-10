<template>
  <header
    class="grid grid-flow-col items-center justify-between px-4 py-4 font-body lg:grid-cols-[auto,1fr,auto] lg:px-8"
  >
    <h1>
      <!-- Fetch DAO name from YAML config -->
      <a
        href="/"
        class="py-4 font-title font-bold text-gray-900 dark:text-white"
        >{{ tenantName }}</a
      >
    </h1>
    <ul v-if="headerLinks.length" class="hidden gap-6 px-12 font-title lg:flex">
      <li v-for="headerLink in headerLinks" :key="headerLink.path">
        <a :href="headerLink.path">{{ headerLink.display }}</a>
      </li>
    </ul>
    <div class="flex items-center gap-4 place-self-end">
      <ConnectButton client:only="vue" />
      <div class="relative" ref="menu">
        <HSButton type="outlined" @click.prevent="toggle">
          <slot name="icon">
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
          </slot>
        </HSButton>
        <ul
          v-show="menuIsOpen"
          class="absolute right-0 z-50 mt-2 w-48 rounded bg-primary-400 p-2 shadow"
        >
          <ul
            v-if="headerLinks.length"
            class="mb-2 border-b border-primary-200 pb-2 lg:hidden"
          >
            <li v-for="headerLink in headerLinks" :key="headerLink.path">
              <a
                :href="headerLink.path"
                class="inline-block w-full rounded px-4 py-2 hover:bg-primary-200"
                >{{ headerLink.display }}</a
              >
            </li>
          </ul>

          <li>
            <a
              href="#"
              class="inline-block w-full rounded px-4 py-2 hover:bg-primary-200"
              target="_blank"
              rel="norefferer noopener"
              >Stakes.social</a
            >
          </li>
          <li>
            <a
              href="https://www.youtube.com/user/suiundo/"
              class="inline-block w-full rounded px-4 py-2 hover:bg-primary-200"
              target="_blank"
              rel="norefferer noopener"
              >YouTube</a
            >
          </li>
          <li v-for="navLink in navLinks" :key="navLink.path">
            <a
              :href="navLink.path"
              class="inline-block w-full rounded px-4 py-2 hover:bg-primary-200"
              target="_blank"
              rel="norefferer noopener"
              >{{ navLink.display }}</a
            >
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import ConnectButton from '../Wallet/ConnectButton.vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'
import { defineComponent, PropType } from '@vue/runtime-core'
import { NavLink } from '@constants/navLink'

export default defineComponent({
  props: {
    tenantName: String,
    headerLinks: {
      type: Object as PropType<NavLink[]>,
      default: [],
    },
    navLinks: {
      type: Object as PropType<NavLink[]>,
      default: [],
    },
  },
  data() {
    return {
      menuIsOpen: false,
    }
  },
  methods: {
    toggle(e) {
      this.menuIsOpen = !this.menuIsOpen
    },
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.menuIsOpen = false
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.close)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.close)
  },
  components: {
    HSButton,
    ConnectButton,
  },
})
</script>
