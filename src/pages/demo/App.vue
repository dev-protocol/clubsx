<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { whenDefined } from '@devprotocol/util-ts'

const account = ref<string>()
const achivementId = ref<string>()
const pageUrl = computed(() => {
  return whenDefined(
    achivementId.value,
    (id) => `https://developers.clubs.place/achivement/${id}`,
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
  <div></div>
</template>
