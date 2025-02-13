<script setup lang="ts">
import { whenNotError, type ErrorOr } from '@devprotocol/util-ts'
import type { ClubsData } from '@pages/api/clubs'
import { onMounted, ref } from 'vue'
import Skeleton from '@components/Global/Skeleton.vue'

const props = defineProps<{
  link?: string
  src?: string
  label?: string
  fetchBy?: string
  color?: 'white'
}>()

const link = ref(props.link)
const src = ref(props.src)
const label = ref(props.label)

onMounted(async () => {
  if (!props.fetchBy) return
  const api = await fetch(`/api/clubs/?id=${props.fetchBy}`).catch(
    (err: Error) => err,
  )
  const data: ErrorOr<ClubsData[]> = await whenNotError(api, (it) => it.json())
  whenNotError(data, ([club]) => {
    link.value = club.url
    src.value = club.avatar
    label.value = club.name
  })
})
</script>

<template>
  <a
    v-if="link && src && label"
    :href="link"
    class="flex items-center gap-2 p-1 w-fit rounded-full border px-2"
    :class="{
      'border-violet-300 bg-violet-100': !props.color,
      'border-white/30 bg-white text-black': props.color === 'white',
    }"
  >
    <img class="w-10 aspect-[16/9] object-contain" :src="src" alt="image" />
    <p class="text-xs font-bold">
      {{ label }}
    </p>
  </a>
  <div v-if="fetchBy && !link" class="h-4 w-1/2">
    <Skeleton />
  </div>
</template>
