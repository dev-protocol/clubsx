<template>
  <header class="flex items-center justify-between px-8 py-4 font-c-sans">
    <h1>
      <a
        href="/"
        class="py-4 font-c-body font-bold text-gray-900 dark:text-white"
        >Temples DAO</a
      >
    </h1>
    <div class="flex items-center gap-4">
      <button disabled class="rounded border border-white py-2 px-4 opacity-20">
        <span>Sign in</span>
      </button>
      <div class="relative" ref="menu">
        <button class="rounded border p-2" @click="menuIsOpen = !menuIsOpen">
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
          class="absolute right-0 z-50 mt-2 w-48 rounded border border-slate-800 bg-neutral-900 p-2 shadow"
        >
          <li>
            <a
              href="#"
              class="inline-block w-full rounded px-4 py-2 hover:bg-black"
              >Powerd</a
            >
          </li>
          <li>
            <a
              href="#"
              class="inline-block w-full rounded px-4 py-2 hover:bg-black"
              >Powerd</a
            >
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import { toggle } from 'src/fixtures/utility'

export default {
  data() {
    return {
      menuIsOpen: false,
    }
  },
  ...toggle('menuIsOpen', 'menu'),
}
</script>
