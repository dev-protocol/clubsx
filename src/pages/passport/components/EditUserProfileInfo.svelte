<script lang="ts">
  import { onMount } from 'svelte'
  import type { Profile } from '@pages/api/profile'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import X from '@components/Icons/X.svelte'
  import Twitch from '@components/Icons/Twitch.svelte'
  import Instagram from '@components/Icons/Instagram.svelte'
  import TikTok from '@components/Icons/TikTok.svelte'
  import YouTube from '@components/Icons/YouTubeColor.svelte'
  import UserProfileSummary from './UserProfileSummary.svelte'

  import { Strings } from '../i18n'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let profile: Profile
  export let profileUpdating: boolean = false
  export let eoa: UndefinedOr<string> = undefined
  export let skinId: UndefinedOr<string> = undefined

  let avatarUploading: boolean = false
  let verifiedSkinId: UndefinedOr<string>
  let skinDescription: UndefinedOr<string>
  let editorOpen = false

  $: {
    verifiedSkinId = profile.skins?.find((sk) =>
      skinId ? sk.id === skinId : true,
    )?.id
    skinDescription =
      profile.skins?.find((sk) =>
        verifiedSkinId ? sk.id === verifiedSkinId : sk,
      )?.description ?? ''
  }

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    if (!e.currentTarget.files) {
      avatarUploading = false
      return
    }

    avatarUploading = true
    const file = e.currentTarget.files[0]
    const avatar = await uploadImageAndGetPath(file)
    profile = { ...profile, avatar }
    avatarUploading = false
  }

  const updateSNS = async (platform: string, username: string) => {
    profile = {
      ...profile,
      sns: {
        ...(profile?.sns ?? ({} as Profile['sns'])),
        [platform]: username,
      },
    }
  }

  const onChangeX = (ev: Event) => {
    updateSNS('x', (event?.target as HTMLInputElement)?.value ?? '')
  }

  const onChangeTwitch = (ev: Event) => {
    updateSNS('twitch', (event?.target as HTMLInputElement)?.value ?? '')
  }

  const onChangeInstagram = (ev: Event) => {
    updateSNS('instagram', (event?.target as HTMLInputElement)?.value ?? '')
  }

  const onChangeTikTok = (ev: Event) => {
    updateSNS('tiktok', (event?.target as HTMLInputElement)?.value ?? '')
  }

  const onChangeYoutube = (ev: Event) => {
    updateSNS('youtube', (event?.target as HTMLInputElement)?.value ?? '')
  }

  const onChangeSkinDescription = () => {
    profile = {
      ...profile,
      skins: profile.skins?.map((sk) =>
        sk.id === verifiedSkinId ? { ...sk, description: skinDescription } : sk,
      ),
    }
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<div class="w-full grid gap-4">
  <button
    on:click={() => (editorOpen = !editorOpen)}
    class="grid grid-cols-[1fr_auto] items-stretch rounded-xl border border-surface-400"
  >
    <UserProfileSummary {profile} skinId={verifiedSkinId} className="p-2" />
    <span class="border-l border-surface-400 flex items-center px-8"
      >{i18n('Edit')}</span
    >
  </button>
  {#if editorOpen}
    <div class="rounded-xl border border-surface-400 p-2">
      <div class="flex flex-col items-start">
        <label class="hs-form-field w-fit" for="avatarPath">
          <span class="hs-form-field__label"> {i18n('Avatar')} </span>
          <div
            class="relative bg-surface-300 w-56 h-56 rounded-full overflow-hidden border border-surface-400 p-3 cursor-pointer"
          >
            {#if avatarUploading}
              <div
                class="rounded-full w-full h-full object-cover animate-pulse bg-gray-500/60"
              />
            {:else if profile.avatar && profile.avatar != ''}
              <img
                src={profile.avatar}
                class="rounded-full w-full h-full object-cover"
                alt={i18n('Avatar')}
              />
            {/if}
          </div>
          <input
            id="avatarPath"
            name="avatarPath"
            style="display:none"
            type="file"
            disabled={profileUpdating || !eoa}
            on:change={onFileSelected}
          />
        </label>
      </div>

      <label class="hs-form-field is-filled mt-16">
        <span class="hs-form-field__label"> {i18n('Username')} </span>
        <input
          class="hs-form-field__input"
          disabled={profileUpdating || !eoa}
          bind:value={profile.username}
          placeholder={i18n('UsernamePlaceholder')}
        />
      </label>

      <label class="hs-form-field is-filled mt-16">
        <span class="hs-form-field__label"> {i18n('Description')} </span>
        <textarea
          class="hs-form-field__input"
          bind:value={skinDescription}
          on:change={onChangeSkinDescription}
          id="profile-description"
          name="profile-description"
          placeholder={i18n('DescriptionPlaceholder')}
        />
        <span class="hs-form-field__helper">
          * {i18n('MarkdownAvailable')}
          <a
            href="https://www.markdownguide.org/basic-syntax"
            target="_blank"
            class="underline [font-size:inherit]"
            rel="noopener noreferrer">({i18n('WhatIsMarkdown')} ↗)</a
          >
        </span>
      </label>

      <label class="hs-form-field is-filled mt-16">
        <span class="hs-form-field__label">SNS</span>
        <div
          class="w-[55%] max-w-full flex flex-col gap-2.5 items-start justify-center"
        >
          <!-- X -->
          <div class="w-full max-w-full flex items-center justify-start gap-5">
            <div class="relative w-6 h-6">
              <X />
            </div>
            <input
              class="hs-form-field__input w-fit grow"
              disabled={profileUpdating || !eoa}
              value={profile?.sns?.x ?? ''}
              on:change|preventDefault={onChangeX}
              placeholder={i18n('SNSPlaceholder', ['X'])}
            />
          </div>

          <!-- Twitch -->
          <div class="w-full max-w-full flex items-center justify-start gap-5">
            <div class="relative w-6 h-6">
              <Twitch />
            </div>
            <input
              class="hs-form-field__input w-fit grow"
              disabled={profileUpdating || !eoa}
              value={profile?.sns?.twitch ?? ''}
              on:change|preventDefault={onChangeTwitch}
              placeholder={i18n('SNSPlaceholder', ['Twitch'])}
            />
          </div>

          <!-- Instagrm -->
          <div class="w-full max-w-full flex items-center justify-start gap-5">
            <div class="relative w-6 h-6">
              <Instagram />
            </div>
            <input
              class="hs-form-field__input w-fit grow"
              disabled={profileUpdating || !eoa}
              value={profile?.sns?.instagram ?? ''}
              on:change|preventDefault={onChangeInstagram}
              placeholder={i18n('SNSPlaceholder', ['Instagram'])}
            />
          </div>

          <!-- Tiktok -->
          <div class="w-full max-w-full flex items-center justify-start gap-5">
            <div class="relative w-6 h-6">
              <TikTok />
            </div>
            <input
              class="hs-form-field__input w-fit grow"
              disabled={profileUpdating || !eoa}
              value={profile?.sns?.tiktok ?? ''}
              on:change|preventDefault={onChangeTikTok}
              placeholder={i18n('SNSPlaceholder', ['TikTok'])}
            />
          </div>

          <!-- Youtube -->
          <div class="w-full max-w-full flex items-center justify-start gap-5">
            <div class="relative w-6 h-6">
              <YouTube />
            </div>
            <input
              class="hs-form-field__input w-fit grow"
              disabled={profileUpdating || !eoa}
              value={profile?.sns?.youtube ?? ''}
              on:change|preventDefault={onChangeYoutube}
              placeholder={i18n('SNSPlaceholder', ['Youtube'])}
            />
          </div>
        </div>
      </label>
    </div>
  {/if}
</div>
