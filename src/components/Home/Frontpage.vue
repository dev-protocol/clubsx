<script setup lang="ts">
import FeedPageContent from '@components/Feed/FeedPageContent.vue'
import type { FeedType } from '@fixtures/api/feed'
import { computed, onMounted, ref } from 'vue'
import { set } from 'es-cookie'
import { CookieKey } from '@constants/cookie'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { ClubsConnectionSignal, i18nFactory } from '@devprotocol/clubs-core'
import CLUBS from '@assets/clubs/Clubs-Decorative.svg'
import { Strings } from '@pages/passport/i18n'
import { distinctUntilChanged, filter } from 'rxjs/operators'
import FrontpageBg from '@assets/clubs/Images.png'
import type { Mode } from '@constants/feeds'
import type { UndefinedOr } from '@devprotocol/util-ts'
dayjs.extend(duration)

const props = defineProps<{
  feeds: FeedType[]
  session?: { user?: string }
  langs: string[]
  mode?: Mode
}>()
const account = ref<UndefinedOr<string>>(props.session?.user)
const connection = ref<typeof Connection>()
const i18nBase = i18nFactory(Strings)
const i18n = ref(i18nBase(props.langs))

onMounted(async () => {
  const C = await import('@devprotocol/clubs-core/connection')
  connection.value = C.connection
  connection
    .value()
    .account.pipe(
      distinctUntilChanged(),
      filter((_, i) => {
        return i === 0 && Boolean(props.session?.user) ? false : true
      }),
    )
    .subscribe((acc) => {
      if (account.value === undefined && acc) {
        location.reload()
      }
      account.value = acc
    })
})

const openSignInModal = () => {
  connection.value?.().signal.next(ClubsConnectionSignal.SignInRequest)
}
</script>

<template>
  <FeedPageContent
    v-if="props.session?.user"
    :feeds="props.feeds"
    :initial-mode="mode"
  />
  <template v-if="props.session?.user === undefined">
    <section
      class="grid gap-8 p-4 h-full bg-cover bg-center justify-center content-center items-center shadow-[inset_0_0_240px_120px_rgb(0_0_0_/_0.5)] min-h-dvh"
      :style="`background-image: url(${FrontpageBg.src})`"
    >
      <div class="mx-auto max-w-xl">
        <img :src="CLUBS.src" alt="CLUBS" class="w-[90%] h-auto mx-auto" />
      </div>
      <div class="mx-auto">
        <h1 class="flex flex-wrap gap-2">
          <span class="font-bold text-4xl italic"
            >{{ i18n('Collect') }}{{ i18n(',') }}</span
          >
          <span class="font-bold text-4xl italic"
            >{{ i18n('Showcase') }}{{ i18n(',') }}</span
          ><span class="font-bold text-4xl italic"
            >{{ i18n('And') }}{{ i18n('Connect') }}{{ i18n('.') }}</span
          >
        </h1>
      </div>
      <div class="mx-auto max-w-sm">
        <div
          class="rounded-2xl bg-black border-x border-t border-surface-200 p-8"
        >
          <p class="font-bold mb-8" v-html="i18n('CopyLine')"></p>
          <button
            @click="openSignInModal"
            class="rounded-full text-2xl w-full p-4 lg:p-8 font-bold bg-white text-black transition-all duration-300 outline outline-4 outline-transparent outline-offset-2 hover:outline-white mb-8"
          >
            {{ i18n('SignInOrSignUp') }}
          </button>
          <p class="text-center -mb-7">
            <a
              href="/app?as=guest"
              class="text-sm transition opacity-30 hover:opacity-100"
              >{{ i18n('UseAsAGuest') }}</a
            >
          </p>
        </div>
      </div>
    </section>
    <footer>
      <slot name="footer" />
    </footer>
  </template>
</template>
