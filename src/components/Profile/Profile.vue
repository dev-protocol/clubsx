<script setup lang="ts">
import { ClubsConnectionSignal, i18nFactory } from '@devprotocol/clubs-core'
import {
  whenDefined,
  whenDefinedAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import type { Profile } from '@pages/api/profile'
import { distinctUntilChanged, filter } from 'rxjs'
import { onMounted, ref, watch } from 'vue'
import { Strings } from './i18n'
import { getPassportOgImages } from '@fixtures/url/passports'
import Modal from '@pages/passport/components/Modal.vue'
import AllItemModal from './AllItemModal.vue'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'

const {
  user: userFromSession,
  profile: profileFromSession,
  langs,
} = defineProps<{
  user?: string
  profile?: Profile
  langs?: string[]
}>()
const user = ref<UndefinedOr<string>>(userFromSession)
const profile = ref<UndefinedOr<Profile>>(profileFromSession)
const i18nBase = i18nFactory(Strings)
const i18n = ref(i18nBase(langs ?? []))
const url = ref<URL>()
const itemOpen = ref<boolean>()
const connection = ref<typeof Connection>()

const refetchProfile = async () =>
  whenDefined(
    user.value,
    (adr) =>
      fetch(`/api/profile/${adr}`).then((r) => r.json()) as Promise<Profile>,
  )
const getPassportOgImage = (id: string) =>
  whenDefinedAll([url.value, user.value], ([_url, _user]) =>
    getPassportOgImages({ url: _url, user: _user, skinId: id }).default.replace(
      'http://localhost:3000',
      'https://prerelease.clubs.place',
    ),
  )
const modalClose = () => {
  itemOpen.value = false
}
const onClickLogout = () => {
  connection.value?.().signal.next(ClubsConnectionSignal.SignOutRequest)
}

watch(user, async (_u) => {
  profile.value = await refetchProfile()
})
onMounted(async () => {
  i18n.value = i18nBase(navigator.languages)
  url.value = new URL(location.href)
  const c = await import('@devprotocol/clubs-core/connection')
  connection.value = c.connection
  c.connection()
    .account.pipe(
      distinctUntilChanged(),
      filter((_, i) => {
        return i === 0 && Boolean(userFromSession) ? false : true
      }),
    )
    .subscribe((acc) => {
      user.value = acc
    })
})
</script>

<template>
  <div v-if="user" class="grid gap-8 container mx-auto p-2">
    <template v-if="profile">
      <img
        :src="profile.avatar"
        :alt="profile.username"
        class="rounded-full object-cover size-40 mx-auto"
      />
      <p class="font-bold text-2xl text-center">{{ profile.username }}</p>
    </template>
    <template v-else>
      <div class="rounded-full animate-pulse size-40 mx-auto bg-black/10" />
      <span
        class="rounded-md animate-pulse bg-black/10 w-full max-w-sm mx-auto"
      >
        <p class="invisible font-bold text-2xl">.</p>
      </span>
    </template>

    <section class="grid gap-4">
      <h2 class="font-bold">{{ i18n('AllPassports') }}</h2>
      <template v-if="profile">
        <ul
          v-if="profile.skins?.length"
          class="grid gap-2 grid-cols-1 lg:grid-cols-2"
        >
          <li v-for="(skin, i) in profile.skins">
            <a :href="`/passport/${user}/${i === 0 ? '' : skin.id}`">
              <img
                :key="skin.id"
                :src="getPassportOgImage(skin.id)"
                class="rounded-md w-full aspect-[1200/630] object-cover"
            /></a>
          </li>
        </ul>
        <div
          v-else
          class="rounded-md p-2 bg-violet-500/10 min-h-40 flex justify-center items-center"
        >
          <a :href="`/passport/${user}`" class="hs-button is-filled">{{
            i18n('CreatePassport')
          }}</a>
        </div>
      </template>
      <template v-else>
        <ul class="grid gap-2 grid-cols-1 lg:grid-cols-2">
          <li
            v-for="() in [1, 1, 1, 1, 1, 1]"
            class="rounded-md w-full aspect-[1200/630] animate-pulse bg-black/10"
          ></li>
        </ul>
      </template>
    </section>

    <section class="flex items-center justify-between">
      <h2 class="font-bold">{{ i18n('AllItems') }}</h2>
      <button @click="itemOpen = true" class="hs-button is-outlined is-small">
        Open
      </button>
    </section>

    <section class="my-12">
      <button
        @click="onClickLogout"
        class="flex items-center gap-2 text-red-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
        {{ i18n('Logout') }}
      </button>
    </section>
  </div>

  <template v-if="!user">
    <slot name="not-logged-in" />
  </template>

  <Modal
    v-if="itemOpen"
    :is-visible="itemOpen"
    :handle-modal-close="modalClose"
    :modal-content="AllItemModal"
    :attrs="{
      account: user,
      local: Boolean(url?.host.includes('localhost')),
      onClickClose: modalClose,
    }"
  />
</template>
