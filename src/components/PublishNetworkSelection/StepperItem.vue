<script setup lang="ts">
import checkImage from '@assets/step-check.svg'
import roundedSquareImage from '@assets/step-rounded-square.svg'

const { itemCompleted, isProcessing, isDisabled, step } = defineProps<{
  itemCompleted: Boolean
  isProcessing: Boolean
  isDisabled: Boolean
  step: String
}>()
</script>

<template>
  <section
    class="align-items-center flex items-center justify-items-center gap-2"
  >
    <img
      :alt="'Publish Step ' + step + ' Status'"
      :src="itemCompleted ? checkImage.src : roundedSquareImage.src"
      class="h-3 w-3"
      v-bind:class="isProcessing ? 'animate-pulse' : ''"
    />
    <p
      class="font-DMSans text-base font-bold"
      v-bind:class="
        isDisabled
          ? 'text-[#3A4158]'
          : isProcessing
            ? 'animate-pulse text-white'
            : 'text-white'
      "
    >
      {{ step }}
    </p>
  </section>
</template>
