<script setup lang="ts">
const props = defineProps<{ class?: string }>()
</script>
<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class ?? 'size-6'"
  >
    <path
      d="M2.25 11.9999L11.204 3.04495C11.644 2.60595 12.356 2.60595 12.795 3.04495L21.75 11.9999M4.5 9.74995V19.8749C4.5 20.4959 5.004 20.9999 5.625 20.9999H9.75V16.1249C9.75 15.5039 10.254 14.9999 10.875 14.9999H13.125C13.746 14.9999 14.25 15.5039 14.25 16.1249V20.9999H18.375C18.996 20.9999 19.5 20.4959 19.5 19.8749V9.74995M8.25 20.9999H16.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
