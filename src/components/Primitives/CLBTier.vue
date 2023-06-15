<template>
  <div class="clb-tier gap-2 rounded-xl bg-black/20 p-3 shadow">
    <img
      v-if="media"
      :src="media"
      class="clb-tier__media"
      :alt="`Media file of the ${title} badge.`"
    />
    <Skeleton v-if="!media" class="min-h-[16rem] w-full" />
    <div class="grid gap-2">
      <div class="clb-tier__title">{{ title }}</div>
      <div class="clb-tier__subtitle opacity-70">{{ subtitle }}</div>
    </div>
    <div v-if="hasAction" class="clb-tier__actions">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { Comment } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'
import HSButton from './Hashi/HSButton.vue'

export default {
  name: 'CLBTier',
  components: { HSButton, Skeleton },
  props: {
    title: String,
    subtitle: String,
    id: String,
    currency: String,
    amount: String,
    media: String,
  },
  computed: {
    hasAction() {
      return (
        this.$slots.default &&
        this.$slots.default() &&
        this.$slots.default().findIndex((o) => o.type !== Comment) !== -1
      )
    },
  },
}
</script>

<style lang="scss" scoped>
@use '@devprotocol/hashi' with (
  $modular-mode: true
);

.clb-tier {
  display: grid;
  justify-items: start;
  gap: hashi.token-get('padding-sm');

  .clb-tier__media {
    width: 100%;
    height: auto;
    border-radius: hashi.token-get('radius-medium');
  }

  .clb-tier__title {
    font-size: hashi.token-get('size-subtitle');
    font-weight: hashi.token-get('weight-bold');
    line-height: hashi.token-get('line-height-condensed');
  }

  .clb-tier__subtitle {
    font-size: hashi.token-get('size-body');
    font-weight: hashi.token-get('weight-normal');
    line-height: hashi.token-get('line-height-condensed');
    text-transform: uppercase;
  }

  .clb-tier__actions {
    //
  }
}
</style>
