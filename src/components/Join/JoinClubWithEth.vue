<template>
  <section class="flex flex-col">
    <h2 class="mb-4 font-title text-4xl font-bold">Join</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">Join {{ tenantName }} in support of the project.</div>

    <h3 class="mb-4 font-title text-2xl font-bold">Select a tier</h3>
    <div class="mb-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
      <Tier
        v-for="tier in memberships"
        v-bind:key="tier.id + tier.price"
        :title="tier.name"
        :id="tier.id"
        :amount="tier.price"
        :currency="tier.currency"
        :badgeImageSrc="tier.imageSrc"
      />
    </div>
  </section>
</template>

<script lang="ts">
import Tier from '@components/Join/Tier.vue'
import { defineComponent, PropType } from '@vue/runtime-core'
import { Membership } from '@plugins/memberships'

export default defineComponent({
  name: 'JoinClubWithEth',
  props: {
    propertyAddress: String,
    memberships: {
      type: Array as PropType<Membership[]>,
      required: true,
    },
    tenantName: String,
    rpcUrl: String,
  },
  async mounted() {},
  methods: {},
  components: {
    Tier,
  },
})
</script>
