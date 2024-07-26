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

  export let domain: string = ''

  let clubsName: string = ''
  let tokenName: string = ''
  let tokenSymbol: string = ''
  let creatorPlatform: CreatorPlatform

  const changeCreatorPlatform = async (platform: CreatorPlatform) => {
    creatorPlatform = platform
  }

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
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">{i18n('ClubNameLabel')}</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={clubsName}
        id="clubs-name"
        name="clubs-name"
      />
      <p class="hs-form-field__helper mt-2">
        * {i18n('ClubNameHelper', [domain])}
      </p>
    </label>

    <!-- Verify it's you -->
    <div class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label"> {i18n('VerifyYouLabel')} </span>
      <div
        class="flex w-full max-w-full h-28 max-h-[28] items-center justify-start gap-2"
      >
        <button
          on:click|preventDefault={() => changeCreatorPlatform('youtube')}
          class={`hs-button is-large is-filled flex flex-col max-w-[33%] grow items-center justify-center gap-2.5 ${
            creatorPlatform !== 'youtube' && 'opacity-50'
          } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
          id="youtube-icon"
          name="youtube-icon"
          disabled={creatorPlatform === 'youtube'}
        >
          <span class="h-auto w-auto">
            <YoutubeIcon />
          </span>
          Youtube
        </button>
        <button
          on:click|preventDefault={() => changeCreatorPlatform('github')}
          class={`hs-button is-large is-filled flex flex-col max-w-[33%] grow items-center justify-center gap-2.5 ${
            creatorPlatform !== 'github' && 'opacity-50'
          } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
          id="github-icon"
          name="github-icon"
          disabled={creatorPlatform === 'github'}
        >
          <span class="h-auto w-auto">
            <GithubIcon />
          </span>
          Github
        </button>
        <button
          on:click|preventDefault={() => changeCreatorPlatform('discord')}
          class={`hs-button is-large is-filled flex flex-col max-w-[33%] grow items-center justify-center gap-2.5 ${
            creatorPlatform !== 'discord' && 'opacity-50'
          } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
          id="discord-icon"
          name="discord-icon"
          disabled={creatorPlatform === 'discord'}
        >
          <span class="h-auto w-auto">
            <DiscordIcon />
          </span>
          Discord
        </button>
      </div>
      <p
        class={`${!creatorPlatform && 'hs-form-field__helper'} mt-2 font-body font-bold text-base capitalize`}
      >
        {@html i18n('VerifiedYouHelper', [creatorPlatform])}
      </p>
    </div>

    <!-- Token name -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">{i18n('TokenNameLabel')}</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={tokenName}
        id="token-name"
        name="token-name"
      />
      <p class="hs-form-field__helper mt-2">
        * {i18n('TokenNameHelper')}
      </p>
    </label>

    <!-- Token symbol -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">{i18n('TokenSymbolLabel')}</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={tokenSymbol}
        id="token-symbol"
        name="token-symbol"
      />
      <p class="hs-form-field__helper mt-2">
        * {i18n('TokenSymbolHelper')}
      </p>
    </label>

    <div class="flex w-full justify-end gap-[20px]">
      <button
        class={`hs-button is-filled is-error w-fit py-6 px-8 ${
          false ? 'animate-pulse bg-gray-500/60' : ''
        }`}
        on:click|preventDefault={() => {}}
      >
        <span class="hs-button__label">Next</span>
      </button>
    </div>
  </section>
</div>
