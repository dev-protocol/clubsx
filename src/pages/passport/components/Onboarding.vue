<script setup lang="ts">
import { connection } from '@devprotocol/clubs-core/connection'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { Strings } from '../i18n'
import { i18nFactory } from '@devprotocol/clubs-core'
import type { Profile } from '@pages/api/profile'
import { nanoid } from 'nanoid'

const props = defineProps<{ eoa?: string }>()
const i18n = i18nFactory(Strings)(navigator.languages)

const isSelf = ref<boolean>()
const el = useTemplateRef('container')
const step = ref<1 | 2 | 3 | 4 | 5>(1)
const profile = computed(
  () =>
    ({
      username: name.value,
      skins: [{ id: nanoid(), description: fave.value }],
    }) satisfies Profile,
)
const name = ref<string>()
const fave = ref<string>()
const status = ref<string>()
const animations = ref({ x: 0, y: 0 })

const submit = async (): Promise<void> => {
  const signer = connection ? connection().signer.getValue() : undefined
  if (!signer) {
    status.value = 'error'
    return
  }

  const hash = `Create the first Passport`
  const sig = await signer
    .signMessage(hash)
    .then((sign) => sign)
    .catch(() => undefined)
  if (!sig) {
    status.value = 'error'
    return
  }
  status.value = 'loading'

  status.value = await fetch('/api/profile', {
    method: 'POST',
    body: JSON.stringify({ profile: profile.value, hash, sig }),
  })
    .then(
      (res) => {
        if (res.status === 200) {
          return 'success'
        }

        throw Error('Could not update profile')
      },
      (err) => {
        throw new Error(err)
      },
    )
    .catch((err) => {
      console.error('Error occured while updating profile', err)
      return 'error'
    })
  if (status.value === 'success') {
    step.value = 5
  }
}

const start = () => {
  if (step.value === 1) {
    const rect = el.value?.getBoundingClientRect()
    const x = window.innerWidth - (rect?.width ?? 0) / 2
    const y = (rect?.top ?? 0) + window.scrollY
    animations.value = { x, y }
    step.value = 2
  } else {
    step.value = 1
  }
}

onMounted(() => {
  connection().account.subscribe((acc) => {
    isSelf.value = acc === props.eoa
  })
})
</script>
<template>
  <div
    v-if="isSelf"
    ref="container"
    :class="{
      'relative transition-all duration-1000': true,
      'outline-transparent h-fit': step === 1,
      'outline-black/5 rounded-xl min-h-screen bg-white z-[99]': step > 1,
    }"
    :style="
      step !== 1
        ? `margin-top: -${animations.y}px; margin-left: -${animations.x}px; margin-right: -${animations.x}px;`
        : 'margin-top: 0px; margin-left: 0px; margin-right: 0px;'
    "
  >
    <div
      class="mx-auto container grid justify-center justify-items-center content-start items-start gap-4 transition-all duration-1000"
    >
      <h2 class="font-bold text-2xl transition-all duration-500 mt-12">
        {{ i18n('StartCustomization') }}
      </h2>
      <button
        :class="{
          'rounded-2xl flex flex-col border border-black/10 outline outline-4 outline-transparent transition-all hover:outline-black/5 w-full justify-center': true,
          'p-8 gap-4 opacity-100': step === 1,
          'p-1 gap-2 opacity-30': step !== 1,
        }"
        @click="start"
      >
        <span
          :class="{
            'transition-all duration-500 font-bold': true,
            'text-2xl': step === 1,
            '': step > 1,
          }"
          >{{ i18n('Start') }}</span
        >
        <video
          src="/assets/website_14447800.mp4"
          autoplay
          muted
          loop
          playsinline
          :class="{
            'w-full transition-all duration-500 mx-auto': true,
            'max-w-60': step === 1,
            'max-w-[0rem]': step !== 1,
          }"
        />
      </button>

      <label
        :class="{
          'hs-form-field rounded-2xl flex !flex-col border border-black/10 outline outline-4 outline-transparent transition-all hover:outline-black/5 w-full !justify-stretch': true,
          '!p-8 gap-4 opacity-100': step === 2,
          '!p-1 gap-2 opacity-30': step !== 2,
        }"
        @click="step = 2"
      >
        <span
          :class="{
            'transition-all duration-500 font-bold text-center': true,
            'text-2xl': step === 2,
            '': step > 2,
          }"
          >{{ i18n('YourName') }}</span
        >
        <input
          type="text"
          v-model="name"
          :class="{
            'hs-form-field__input transition-all duration-500 is-fullwidth is-outlined': true,
            'h-auto': step === 2,
            'h-[0rem]': step > 2,
          }"
        />

        <button
          @click.stop="step = step === 2 ? 3 : 2"
          v-if="step === 2"
          class="hs-button is-fullwidth is-filled"
        >
          {{ i18n('Next') }}
        </button>
      </label>

      <label
        :class="{
          'hs-form-field rounded-2xl flex !flex-col border border-black/10 outline outline-4 outline-transparent transition-all hover:outline-black/5 w-full !justify-stretch': true,
          '!p-8 gap-4 opacity-100': step === 3,
          '!p-1 gap-2 opacity-30': step !== 3,
        }"
        @click="step = 3"
      >
        <span
          :class="{
            'transition-all duration-500 font-bold text-center': true,
            'text-2xl': step === 3,
            '': step > 3,
          }"
          >{{ i18n('FaveCharacterss') }}</span
        >
        <span
          :class="{
            'transition-all duration-500 text-black/50 text-center': true,
            'text-base': step === 3,
            'text-xs': step > 3,
          }"
          >{{ i18n('FaveCharactersExample') }}</span
        >
        <textarea
          type="text"
          v-model="fave"
          :class="{
            'hs-form-field__input transition-all duration-500 is-fullwidth is-outlined': true,
            'max-h-52': step === 3,
            'max-h-[0rem]': step > 3,
          }"
        />

        <button
          @click.stop="step = step === 3 ? 4 : 3"
          v-if="step === 3"
          class="hs-button is-fullwidth is-filled"
        >
          {{ i18n('Next') }}
        </button>
      </label>

      <div
        :class="{
          'rounded-2xl flex flex-col border border-black/10 outline outline-4 outline-transparent transition-all hover:outline-black/5 w-full justify-center': true,
          'p-8 gap-4 opacity-100': step === 4,
          'p-1 gap-2 opacity-30': step !== 4,
        }"
        @click="step = 4"
      >
        <span
          :class="{
            'transition-all duration-500 font-bold text-center': true,
            'text-2xl': step === 4,
            '': step !== 4,
          }"
          >{{ i18n('Finish') }}</span
        >
        <button
          v-if="step === 4"
          class="hs-button is-fullwidth is-filled disabled:animate-pulse"
          :disabled="status === 'loading'"
          @click="submit"
        >
          {{ i18n('CreatePassport') }}
        </button>

        <video
          src="/assets/add-file_8948318.mp4"
          autoplay
          muted
          loop
          playsinline
          :class="{
            'w-full transition-all duration-500 mx-auto': true,
            'max-w-60': step === 4 && status === 'loading',
            'max-w-[0rem]': step !== 4 || status !== 'loading',
          }"
        />
      </div>

      <div
        :class="{
          'max-w-xl rounded-2xl flex flex-col border border-black/10 outline outline-4 outline-transparent transition-all hover:outline-black/5 w-full justify-center p-8 gap-4': true,
          hidden: step !== 5,
        }"
      >
        <span
          class="transition-all duration-500 font-bold text-center text-2xl"
          >{{ i18n('PassportCreated') }}</span
        >
        <video
          src="/assets/fireworks_8819063.mp4"
          autoplay
          muted
          loop
          playsinline
          class="w-full transition-all duration-500 w-full mx-auto max-w-60"
        />
        <p class="font-bold text-center text-xl">
          {{ i18n('AfterPassportCreated') }}
        </p>
        <a
          :href="`/passport/${props.eoa}/edit`"
          class="hs-button is-fullwidth is-filled"
        >
          {{ i18n('Next') }}
        </a>
      </div>
    </div>
  </div>
</template>
