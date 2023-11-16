<template>
  <section class="flex flex-col">
    <h2 class="mb-4 font-title text-4xl font-bold">Join</h2>
    <!-- DAOName from YAML config -->
    <div class="mb-8">{{ i18n('JoinTenant', [tenantName]) }}</div>

    <h3 class="mb-4 font-title text-2xl font-bold">{{ i18n('SelectTier') }}</h3>
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

<script lang="ts" setup>
import Tier from '@components/Join/Tier.vue'
import { i18nFactory } from '@devprotocol/clubs-core'
import type { Membership } from '@plugins/memberships'
import { Strings } from './i18n'
import { onMounted } from 'vue'

const { tenantName, memberships } = defineProps<{
  propertyAddress: string
  tenantName: string
  rpcUrl: string
  memberships: Membership[]
}>()

const i18nBase = i18nFactory(Strings)
let i18n = i18nBase(['en'])

onMounted(() => {
  i18n = i18nBase(navigator.languages)
})
</script>
