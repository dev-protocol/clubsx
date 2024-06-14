<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { whenDefined } from '@devprotocol/util-ts'

const account = ref<string>()
const achivementId = ref<string>()
const pageUrl = computed(() => {
  return (
    whenDefined(
      achivementId.value,
      (id) => `https://developers.clubs.place/achivement/${id}`,
    ) ?? 'x'
  )
})

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')

  connection().account.subscribe((connectedAccount) => {
    account.value = connectedAccount
  })
})

watch(account, async (userAccount) => {
  console.log({ userAccount })
  if (!userAccount) {
    return
  }

  const apiRes = await fetch(`/api/mock/achivement/${userAccount}`)
  const { id } = await apiRes.json()
  achivementId.value = id
})
</script>

<template>
  <div
    class="p-8 rounded-3xl bg-black/10 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700"
    :class="account ? 'opacity-30' : ''"
  >
    <h2 class="font-bold text-3xl">Sign in</h2>
    <slot />
  </div>
  <div
    class="p-8 rounded-3xl bg-black/10 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700"
    :class="account ? '' : 'opacity-30'"
  >
    <h2 class="font-bold text-3xl">Your achievement</h2>
    <div
      v-if="!pageUrl"
      class="h-8 w-full max-w-48 animate-pulse rounded-full bg-gray-400/60 text-transparent"
    />
    <a v-if="pageUrl" :href="pageUrl" class="font-bold text-4xl">Get</a>
  </div>
</template>
