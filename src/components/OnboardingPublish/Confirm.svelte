<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory, type ClubsConfiguration } from '@devprotocol/clubs-core'

  import { Strings } from './i18n'
  import GithubIcon from './GithubIcon.svelte'
  import YoutubeIcon from './YoutubeIcon.svelte'
  import DiscordIcon from './DiscordIcon.svelte'
  import { type CreatorPlatform } from './types'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let clubsName: string
  export let tokenName: string
  export let tokenSymbol: string

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<div
  class="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto"
>
  <!-- Hero Header -->
  <section class="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
    <h1 class="text-2xl font-bold md:text-5xl text-center">{i18n('Header')}</h1>
    <!-- When want to add this to future we need to add translation and uncomment code of this line. -->
    <!-- <p>{i18n('SubHeader')}</p> -->
  </section>

  <!-- Core inputs -->
  <section class="grid gap-16 w-full max-w-full mb-16 md:mb-32">
    <!-- Clubs name -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('ClubNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">{clubsName}</p>
    </div>

    <!-- Token name -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">{tokenName}</p>
    </div>

    <!-- Token symbol -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenSymbolLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">
        {tokenSymbol}
      </p>
    </div>

    <!-- Token supply -->
    <div class="hs-form-field is-filled !gap-4">
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">
        10,000,000 {tokenSymbol}
      </p>
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenSupply')}</span
      >
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        true ? '' : 'opacity-30'
      }`}
    >
      <p class="font-normal text-base text-white">{i18n('CreateASig')}</p>
      <button
        class={`hs-button is-filled px-8 py-4 ${
          false ? 'animate-pulse bg-gray-500/60' : ''
        } ${false ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) => {}}
      >
        {i18n('Sign')}
      </button>
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        true ? '' : 'opacity-30'
      }`}
    >
      <p class="font-normal text-base text-white">{i18n('StartClub')}</p>
      <button
        class={`hs-button is-filled px-8 py-4 ${
          false ? 'animate-pulse bg-gray-500/60' : ''
        } ${false ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) => {}}
      >
        {i18n('Tokenize')}
      </button>
    </div>
  </section>
</div>
