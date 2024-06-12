<script lang="ts">
  import { onMount } from 'svelte'
  import type { Profile } from '@pages/api/profile'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import { Strings } from '../i18n'

  export let id: string

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  let connection: UndefinedOr<typeof Connection> = undefined
  let profile: Profile = {}
  let eoa: UndefinedOr<string> = undefined
  let avatarUploading = false
  let profileUpdating = false
  let updatingStatus: UndefinedOr<'success' | 'error'> = undefined

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    avatarUploading = true
    const file = e.currentTarget.files[0]
    const avatar = await uploadImageAndGetPath(file)
    profile = { ...profile, avatar }
    avatarUploading = false
  }

  const onSubmit = async () => {
    profileUpdating = true
    const signer = connection ? connection().signer.getValue() : undefined
    if (!signer) {
      return
    }
    const hash = `Update profile: ${profile.username} @ts:${new Date().getTime()}`
    const sig = await signer.signMessage(hash)
    const req = await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ profile, hash, sig }),
    })

    profileUpdating = false
    updatingStatus = req.status === 200 ? 'success' : 'error'
    setTimeout(() => {
      updatingStatus = undefined
    }, 3000)
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)

    const { connection: _conn } = await import(
      '@devprotocol/clubs-core/connection'
    )
    connection = _conn
    connection().account.subscribe((acc) => {
      eoa = acc
    })
  })

  onMount(async () => {
    const req = await fetch(`/api/profile/${id}`)
    const data = await req.json()
    profile = {
      ...data,
    }
  })
</script>

<div class="w-full">
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
        disabled={profileUpdating}
        on:change={onFileSelected}
      />
    </label>
  </div>

  <label class="hs-form-field is-filled">
    <span class="hs-form-field__label"> {i18n('Username')} </span>
    <input
      class="hs-form-field__input"
      disabled={profileUpdating}
      bind:value={profile.username}
    />
  </label>

  {#if eoa === id}
    <button
      on:click={onSubmit}
      disabled={profileUpdating}
      class={`hs-button is-filled is-large w-fit ${
        updatingStatus === 'success'
          ? 'is-success'
          : updatingStatus === 'error'
            ? 'is-error'
            : ''
      }`}
      >{updatingStatus === 'success'
        ? i18n('Saved')
        : updatingStatus === 'error'
          ? i18n('Error')
          : i18n('Save')}</button
    >
  {/if}
</div>
