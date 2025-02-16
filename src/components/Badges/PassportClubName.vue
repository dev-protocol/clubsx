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
  containerClass?: string
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
  <div class="@container/club-name">
    <a
      v-if="link && src && label"
      :href="link"
      class="flex items-center flex-wrap gap-0.5 p-0.5 w-fit rounded-md border @[14rem]/club-name:px-2"
      :class="{
        'border-violet-300 bg-violet-100': !props.color,
        'border-white/30 bg-white text-black': props.color === 'white',
        [props.containerClass ?? '']: Boolean(props.containerClass),
      }"
    >
      <p class="text-[0.65rem]">Licensed by</p>
      <span class="flex items-center gap-0.5">
        <img
          class="w-6 @[14rem]/club-name:w-10 aspect-[16/9] object-contain"
          :src="src"
          alt="image"
        />
        <p class="text-[0.65rem] font-bold">
          {{ label }}
        </p>
      </span>
    </a>
    <div v-if="fetchBy && !link" class="h-4 w-1/2">
      <Skeleton />
    </div>
  </div>
</template>
