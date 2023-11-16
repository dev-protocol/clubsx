<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import { onMount } from 'svelte'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import type { Profile } from '@pages/api/profile'
  import { hashMessage } from 'ethers'

  export let id: string

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
    const hash = hashMessage('Save')
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

<div class="mx-auto mb-5 max-w-5xl px-4">
  <div class="flex flex-col items-start">
    <label class="hs-form-field w-fit" for="avatarPath">
      <span class="hs-form-field__label"> Avatar </span>
      <div
        class="relative bg-white/10 w-56 h-56 rounded-full overflow-hidden border border-white/20 p-3 cursor-pointer"
      >
        {#if avatarUploading}
          <div
            class="rounded-full w-full h-full object-cover animate-pulse bg-gray-500/60"
          />
        {:else if profile.avatar && profile.avatar != ''}
          <img
            src={profile.avatar}
            class="rounded-full w-full h-full object-cover"
            alt=""
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
    <span class="hs-form-field__label"> Username </span>
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
        ? 'Saved'
        : updatingStatus === 'error'
        ? 'Error'
        : 'Save'}</button
    >
  {/if}
</div>
