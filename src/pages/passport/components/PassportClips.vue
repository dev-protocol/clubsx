<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { i18nFactory } from '@devprotocol/clubs-core'

import { Strings } from '../i18n'
import ImageCard from './ImageCard.vue'
import type { PassportClip } from '../types'
import PassportClipCard from './PassportClip.vue'

const props = defineProps<{ 
  clips: PassportClip[],
  id: string,
}>()

const i18nBase = i18nFactory(Strings)

let i18n = ref<ReturnType<typeof i18nBase>>(i18nBase(['en']))

onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)
})
</script>

<template>
  <section class="grid gap-8">
    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <li v-if="clips?.length" v-for="(clip, index) in clips" :key="index" class="empty:hidden">
        <PassportClipCard :item="clip" :id="id" :index="index" />
      </li>
    </ul>
  </section>
</template>
