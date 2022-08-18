<template>
  <CLBTier
    :title="title"
    :subtitle="`${omittedAmount} $${currency}`"
    :media="badgeImageSrc"
  >
    <HSButton :link="idLink" type="filled">Select</HSButton>
  </CLBTier>
</template>

<script>
import { defineComponent } from '@vue/runtime-core'
import BigNumber from 'bignumber.js'
import Skeleton from '@components/Global/Skeleton.vue'
import HSButton from '../Primitives/Hashi/HSButton.vue'
import CLBTier from '@components/Primitives/CLBTier.vue'

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
  components: { CLBTier, HSButton, Skeleton },
})
</script>
