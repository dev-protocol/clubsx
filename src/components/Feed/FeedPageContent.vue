<script setup lang="ts">
import Feed from '@components/Feed/Feed.vue'
import type { FeedType } from '../../fixtures/api/feed'
import { computed, ref, watch } from 'vue'
import { set } from 'es-cookie'
import { CookieKey } from '@constants/cookie'
import { Mode } from '@constants/feeds'
import VirtualScroll from './VirtualScroll.vue'

const props = defineProps<{
  feeds: FeedType[]
  initialMode?: Mode
}>()

const mode = ref<Mode>(props.initialMode ?? Mode.Latest)
const feedsByMode = ref<Record<Mode, FeedType[]>>({
  [Mode.Latest]: props.initialMode === Mode.Latest ? props.feeds : [],
  [Mode.Top]: props.initialMode === Mode.Top ? props.feeds : [],
  [Mode.Random6]: props.initialMode === Mode.Random6 ? props.feeds : [],
})
const switchingTo = ref<Mode>()
const items = computed(() => feedsByMode.value[mode.value])

const changeMode = async (newmode: Mode) => {
  switchingTo.value = newmode
  if (feedsByMode.value[newmode].length > 0) {
    // Switch now, update later.
    mode.value = newmode
  }
  const feedSrc = new URL('/api/feed', location.origin)
  feedSrc.searchParams.set('tag', newmode)
  const res = await fetch(feedSrc)
  const json = (await res.json()) as {
    content: FeedType[] | null
    message: string
  }
  feedsByMode.value = { ...feedsByMode.value, [newmode]: json.content ?? [] }
  mode.value = newmode
  switchingTo.value = undefined
}

watch(mode, (mode_) => {
  set(CookieKey.DefaultFeed, mode_)
})
</script>
<template>
  <nav>
    <ul class="grid grid-cols-3 justify-stretch">
      <li>
        <button
          @click="changeMode(Mode.Latest)"
          class="w-full py-2 lg:py-4 hover:font-bold"
          :class="{
            'text-violet-700 font-bold': mode === Mode.Latest,
            'font-light': mode !== Mode.Latest && !switchingTo,
            'animate-pulse font-bold': switchingTo === Mode.Latest,
          }"
        >
          Latest
        </button>
      </li>
      <li>
        <button
          @click="changeMode(Mode.Top)"
          class="w-full py-2 lg:py-4 hover:font-bold"
          :class="{
            'text-violet-700 font-bold': mode === Mode.Top,
            'font-light': mode !== Mode.Top && !switchingTo,
            'animate-pulse font-bold': switchingTo === Mode.Top,
          }"
        >
          Top
        </button>
      </li>
      <li>
        <button
          @click="changeMode(Mode.Random6)"
          class="w-full py-2 lg:py-4 hover:font-bold"
          :class="{
            'text-violet-700 font-bold': mode === Mode.Random6,
            'font-light': mode !== Mode.Random6 && !switchingTo,
            'animate-pulse font-bold': switchingTo === Mode.Random6,
          }"
        >
          6 random picks
        </button>
      </li>
    </ul>
  </nav>
  <div class="flex flex-col p-2 h-full rounded-xl md:border boder-black/20">
    <div
      class="flex flex-col gap-2 flex-grow pb-24 h-full transition"
      :class="{ 'opacity-70': switchingTo && switchingTo !== mode }"
    >
      <VirtualScroll :items="items" :itemHeight="278" :buffer="10" />
      <!--
      <Feed v-for="feed in items" :key="feed.id" v-bind="feed" />
      -->
    </div>
  </div>
</template>
