<template>
  <div>
    <div>
      <img
        v-if="badgeImageSrc"
        :src="badgeImageSrc"
        class="w-ful h-auto rounded"
      />
      <div v-if="!badgeImageSrc" class="animate-pulse">
        <div class="w-ful min-h-[16rem] rounded bg-gray-500/60"></div>
      </div>
    </div>
    <div class="text-2xl">{{ title }}</div>
    <div class="mb-2 uppercase">{{ omittedAmount }} ${{ currency }}</div>
    <a :href="idLink">
      <button class="rounded-sm border bg-gray-600 p-2 px-4">Select</button>
    </a>
  </div>
</template>

<script>
import { defineComponent } from '@vue/runtime-core'
import BigNumber from 'bignumber.js'

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
  },
  data() {
    return {
      idLink: `/join/${this.id}`,
    }
  },
})
</script>
