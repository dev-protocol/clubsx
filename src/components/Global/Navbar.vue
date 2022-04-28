<template>
  <header
    class="
      border-b-2
      text-black
      dark:border-b-0 dark:text-white dark:shadow-xl
      burger:flex
      burger:items-center
      burger:justify-between
      burger:px-4
      burger:py-3
    "
  >
    <div
      class="
        flex
        w-full
        flex-wrap
        items-center
        justify-between
        px-4
        py-3
        align-baseline
        burger:flex-nowrap burger:p-0
      "
    >
      <!-- Logo -->
      <a href="/" class="py-4 text-gray-900 md:p-4">D Club</a>

      <div class="flex">
        <ThemeButton />
        <div class="visible burger:hidden">
          <button
            @click="smIsOpen = !smIsOpen"
            type="button"
            class="
              block
              text-gray-800
              hover:text-black
              focus:text-black focus:outline-none
              dark:text-white
            "
          >
            <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path
                v-if="smIsOpen"
                fill-rule="evenodd"
                d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
              />
              <path
                v-if="!smIsOpen"
                fill-rule="evenodd"
                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import ThemeButton from './ThemeButton.vue'
export default {
  data() {
    return {
      // states for each of the 4 dropdowns
      isOpen: [false, false, false, false],
      // state for mobile view (hamburger icon)
      smIsOpen: false,
    }
  },
  components: {
    ThemeButton,
  },
}
</script>
