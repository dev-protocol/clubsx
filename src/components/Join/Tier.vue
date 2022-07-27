<template>
  <div class="grid justify-items-start gap-2">
    <img
      v-if="badgeImageSrc"
      :src="badgeImageSrc"
      class="w-ful h-auto rounded"
    />
    <Skeleton v-if="!badgeImageSrc" class="min-h-[16rem] w-full" />
    <div class="mb-2 font-title text-2xl font-bold">{{ title }}</div>
    <div class="mb-2 uppercase">{{ omittedAmount }} ${{ currency }}</div>
    <a :href="idLink">
      <button class="rounded-sm border bg-gray-600 p-2 px-4">Select</button>
    </a>
  </div>
</template>

<script>
import { defineComponent } from '@vue/runtime-core'
import BigNumber from 'bignumber.js'
import Skeleton from '../Global/Skeleton.vue'

export default defineComponent({
  name: 'QuestCard',
  props: {
    title: String,
    id: String,
    currency: String,
    amount: String,
    badgeImageSrc: String,
  },
  computed: {
    omittedAmount() {
      return new BigNumber(this.amount).dp(5).toFixed()
    },
    idLink() {
      return `/join/${this.id}${
        this.currency !== 'dev' ? `?input=${this.currency}` : ''
      }`
    },
  },
  components: { Skeleton },
})
</script>
