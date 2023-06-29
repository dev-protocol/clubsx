<template>
  <div class="border-dp-black-200 border p-4">
    <div class="mb-4">
      <div class="text-2xl">Period</div>
      <div class="text-gray-400">TBD</div>
    </div>
    <div>
      <div class="text-2xl">Required action(s)</div>
      <div class="text-gray-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestInfo',
  props: {
    period: String,
    description: String,
  },
}
</script>
