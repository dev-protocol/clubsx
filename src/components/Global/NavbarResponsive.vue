<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Bars3 from '@components/Icons/bars-3.vue'
import XMark from '@components/Icons/x-mark.vue'
import HomeLogo from '@components/Icons/home.vue'
import { passportClass } from '@fixtures/ui/passport'

const props = defineProps<{
  pageTitle?: string
  showConnectButton?: boolean
  showConnectButtonOnlySignedIn?: boolean
}>()

const open = ref<boolean>()
const animate = ref<boolean>()
const connected = ref<boolean>(false)

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')
  connection().account.subscribe((acc) => {
    connected.value = typeof acc === 'string'
  })
})

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
      <h1 class="flex items-center gap-4" :class="passportClass('heading')">
        <slot name="clubs-logo" />
        <span v-if="Boolean(props.pageTitle)" class="lg:text-xl font-bold">{{
          props.pageTitle
        }}</span>
      </h1>
    </a>

    <template v-if="false">
      <!-- NOW THIS UI IS NOT USED -->
      <span class="w-full flex items-center justify-end lg:hidden gap-4">
        <slot name="before:mobile-open-bar" />

        <button type="button" @click="() => (open = true)" class="">
          <Bars3 />
        </button>
      </span>
    </template>

    <slot name="before:aside-panel" />

    <template v-if="false">
      <!-- NOW THIS UI IS NOT USED -->
      <span
        class="w-full absolute top-0 left-0 gap-4 px-2 py-4 bg-white text-black rounded-b-lg shadow content-start justify-stretch justify-items-center transition-[height] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-x-hidden overflow-y-scroll"
        :class="[
          { 'grid z-[1]': open },
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

        <template
          v-if="props.showConnectButton || props.showConnectButtonOnlySignedIn"
        >
          <span
            :class="{
              invisible: props.showConnectButtonOnlySignedIn && !connected,
            }"
          >
            <slot name="connect-button" />
          </span>
        </template>

        <slot name="after:connect-button" />
      </span>
    </template>
  </div>
</template>
