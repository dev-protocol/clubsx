<script setup lang="ts">
import { ref, watch } from 'vue'
import Bars3 from '@components/Icons/bars-3.vue'
import XMark from '@components/Icons/x-mark.vue'
import HomeLogo from '@components/Icons/home.vue'
import { passportClass } from '@fixtures/ui/passport'

const props = defineProps<{ pageTitle?: string; showConnectButton?: boolean }>()

const open = ref<boolean>()
const animate = ref<boolean>()

watch(open, () => {
  setTimeout(
    () => {
      animate.value = open.value
    },
    open.value ? 10 : 500,
  )
})
</script>

<template>
  <div
    class="relative flex items-center justify-between px-2 py-4 gap-2 lg:px-6"
  >
    <a href="/">
      <h1
        class="hidden md:flex items-center gap-4"
        :class="passportClass('heading')"
      >
        <slot name="clubs-logo" />
        <span v-if="Boolean(props.pageTitle)" class="lg:text-xl font-bold">{{
          props.pageTitle
        }}</span>
      </h1>
      <span
        class="w-full flex items-center justify-end lg:hidden cursor-pointer"
      >
        <HomeLogo />
      </span>
    </a>

    <span class="w-full flex items-center justify-end lg:hidden">
      <button type="button" @click="() => (open = true)" class="">
        <Bars3 />
      </button>
    </span>

    <span
      class="w-full absolute top-0 left-0 gap-4 px-2 py-4 bg-white text-black rounded-b-lg shadow content-start justify-stretch justify-items-center transition-[height] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-x-hidden overflow-y-scroll"
      :class="[
        { grid: open },
        { hidden: !open },
        { 'h-[50vh]': animate },
        { 'h-0': !animate },
        'lg:relative lg:h-fit lg:flex lg:top-[unset] lg:left-[unset] lg:py-0 lg:bg-transparent lg:text-inherit lg:rounded-none lg:shadow-none lg:justify-between lg:items-center lg:overflow-visible',
      ]"
    >
      <div class="w-full lg:hidden">
        <h1 class="flex items-center gap-4">
          <slot name="clubs-logo" />
          <span v-if="Boolean(props.pageTitle)" class="font-bold">{{
            props.pageTitle
          }}</span>
        </h1>
      </div>

      <button
        type="button"
        @click="() => (open = false)"
        class="absolute top-4 right-2 place-self-end flex items-center justify-center rounded-full size-12 bg-black text-white shadow lg:hidden"
      >
        <XMark />
      </button>

      <i class="my-4 lg:hidden" role="presentation"></i>

      <slot name="before:connect-button" />

      <template v-if="props.showConnectButton">
        <slot name="connect-button" />
      </template>

      <slot name="after:connect-button" />
    </span>
  </div>
</template>
