<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'

  import X from '@assets/X.svg'
  import Twitch from '@assets/twitch.svg'
  import Tiktok from '@assets/tiktok.svg'
  import Youtube from '@assets/youtube.svg'
  import Instagram from '@assets/instagram.svg'

  const i18nBase = i18nFactory(Strings)
  const emptyPassportItem = {} as PassportItem

  export let id: string
  export let isLocal: boolean

  let profileFetching = true
  let i18n = i18nBase(['en'])
  let avatarUploading = false
  let profileUpdating = false
  let passportItemFetching = true
  let profile: Profile = {} as Profile
  let profileFromAPI: Profile = profile
  let passportSkinItems: PassportItem[] = []
  let passportNonSkinItems: PassportItem[] = []
  let passportItemsFromAPI: PassportItem[] = []
  let eoa: UndefinedOr<string> = undefined
  let connection: UndefinedOr<typeof Connection> = undefined
  let updatingStatus: UndefinedOr<'success' | 'error'> = undefined

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

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
      profileUpdating = false
      updatingStatus = 'error'
      return
    }

    const hash = `Update profile: ${profile.username} @ts:${new Date().getTime()}`
    const sig = await signer
      .signMessage(hash)
      .then((sign) => sign)
      .catch(() => undefined)
    if (!sig) {
      profileUpdating = false
      updatingStatus = 'error'
      return
    }

    await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ profile, hash, sig }),
    })
      .then(
        (res) => {
          if (res.status === 200) {
            updatingStatus = 'success'
            return
          }

          throw Error('Could not update profile')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .catch((err) => {
        console.log('Error occured while updating profile')
        updatingStatus = 'error'
        return
      })
      .finally(() => {
        profileUpdating = false
      })

    setTimeout(() => {
      updatingStatus = undefined
    }, 3000)
  }

  const _fetchProfile = async () => {
    profileFetching = true

    const fetchedProfile = await fetch(`/api/profile/${id}`)
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Profile data not found')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then(
        (_profile) => {
          if (_profile) {
            return _profile as Profile
          }
          throw new Error('Profile data not found')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .catch((err) => {
        console.log('Error fetching profile', err)
        return {} as Profile
      })
      .finally(() => {
        profileFetching = false
      })

    profile = {
      ...fetchedProfile,
    }
    // To preserve state before making changes to profile.
    profileFromAPI = {
      ...fetchedProfile,
    }

    console.log('Profile at fetching', profile)
  }

  const _fetchPassportItems = async () => {
    passportItemFetching = true

    const fetchedPassportItems = await fetch(
      `/api/assets/related/account/${eoa}/passportItems?&size=999`,
    )
      .then(
        (res) => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Passport items data not found')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then(
        (res) => {
          if (res) {
            return res as {
              data: Array<PassportItem>
              last: string | number
              total: string | number
            }
          }
          throw new Error('Passport items data not found')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .then(
        (res) => {
          if (res) {
            return res.data
          }
          throw new Error('Passport items data not found')
        },
        (err) => {
          throw new Error(err)
        },
      )
      .catch((err) => {
        console.log('Error fetching passport items', err)
        return []
      })
      .finally(() => {
        passportItemFetching = false
      })

    passportItemsFromAPI = fetchedPassportItems
    passportSkinItems = passportItemsFromAPI.filter(
      (item) =>
        item.itemAssetType === 'css' ||
        item.itemAssetType === 'stylesheet-link',
    )
    passportNonSkinItems = passportItemsFromAPI.filter(
      (item) =>
        item.itemAssetType !== 'css' &&
        item.itemAssetType !== 'stylesheet-link',
    )
  }

  const _connectOnMount = async () => {
    const { connection: _conn } = await import(
      '@devprotocol/clubs-core/connection'
    )

    connection = _conn
    eoa = connection()?.account?.getValue()
    if (eoa) {
      _fetchPassportItems()
    }

    connection().account.subscribe((acc: UndefinedOr<string>) => {
      const oldEOA = eoa
      eoa = acc
      if (eoa !== oldEOA) {
        // Wallet is connected or addrress has changed so update the data again.
        _fetchProfile()
        _fetchPassportItems()
      }
    })
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    _connectOnMount()
    _fetchProfile()
  })

  const addProfile = async () => {}

  const selectPassportSkinItem = (item: PassportItem) => {
    if (!item.payload) {
      console.log(
        `Passport skin item not selected as theme since item.paylaod missing`,
        item.id,
      )
      return
    }

    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        // Set skins to the updated value or append new value of theme.
        {
          ...(profile.skins?.at(0) ?? ({} as Skin)),
          theme: item.payload,
        },
      ],
    }

    console.log(
      'Passport item and profile at selecting passport skin item',
      item,
      profile,
    )
  }

  const resetPassportSkinSelectedItems = () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins:
        !profileFromAPI.skins || !profileFromAPI.skins?.at(0)
          ? ([] as Skin[])
          : [profileFromAPI.skins[0]],
    }

    console.log('Profile at reseting passport skin item', profile)
  }

  const togglePinnnedPassortNonSkinItem = async (item: PassportItem) => {
    if (!item.payload) {
      console.log(
        `Passport non skin item not pinned as clips since item.paylaod missing`,
        item.id,
      )
      return
    }

    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        // Set skins to the updated value or append new value of theme.
        {
          ...(profile.skins?.at(0) ?? ({} as Skin)),
          clips: profile.skins?.at(0)?.clips?.includes(item.payload)
            ? [
                ...(profile.skins
                  ?.at(0)
                  ?.clips?.filter((clip) => clip !== item.payload) ?? []),
              ]
            : [...(profile.skins?.at(0)?.clips ?? []), item.payload],
        },
      ],
    }

    console.log(
      'Passort item and profile at pinning passport non skin item',
      item,
      profile,
    )
  }

  const resetPinnedNonSkinItems = async () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins:
        !profileFromAPI.skins ||
        !profileFromAPI.skins?.at(0) ||
        !profile.skins ||
        !profile.skins?.at(0)
          ? ([] as Skin[])
          : [
              {
                ...(profile.skins?.at(0) ?? ({} as Skin)),
                clips: profileFromAPI.skins?.at(0)?.clips ?? [],
              },
            ], // Retain other field reset clips from response from API.
    }

    console.log('Profile at resetting pinned non skin item', profile)
  }
</script>

<div class="w-full">
  <div
    class="w-fit max-w-full flex gap-[15px] py-[8px] px-[16px] items-center justify-start"
  >
    <p class="font-body font-bold text-base text-center">Default profile</p>
    <!-- Todo: <button> element replace disabled when button is added -->
    <button
      on:click|preventDefault={addProfile}
      disabled={true}
      class="hs-button is-filled is-large w-fit text-center line-through"
      >Add profile</button
    >
  </div>

  <div class="flex flex-col items-start mt-[76px]">
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

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label"> {i18n('Username')} </span>
    <input
      class="hs-form-field__input"
      disabled={profileUpdating || !eoa}
      bind:value={profile.username}
    />
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label"> {i18n('Description')} </span>
    <textarea
      class="hs-form-field__input"
      bind:value={profile.description}
      id="profile-description"
      name="profile-description"
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

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">SNS</span>
    <div
      class="w-[55%] max-w-full flex flex-col gap-2.5 items-start justify-center"
    >
      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6 overflow-hidden">
          <img
            src={X.src}
            class="rounded-full w-full h-full object-cover"
            alt={'SNS'}
          />
        </div>
        <input
          class="hs-form-field__input w-fit grow"
          disabled={profileUpdating || !eoa}
          bind:value={profile.xProfile}
        />
      </div>

      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6 overflow-hidden">
          <img
            src={Twitch.src}
            class="rounded-full w-full h-full object-cover"
            alt={'SNS'}
          />
        </div>
        <input
          class="hs-form-field__input w-fit grow"
          disabled={profileUpdating || !eoa}
          bind:value={profile.twitchProfile}
        />
      </div>

      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6 overflow-hidden">
          <img
            src={Instagram.src}
            class="rounded-full w-full h-full object-cover"
            alt={'SNS'}
          />
        </div>
        <input
          class="hs-form-field__input w-fit grow"
          disabled={profileUpdating || !eoa}
          bind:value={profile.instagramProfile}
        />
      </div>

      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6 overflow-hidden">
          <img
            src={Tiktok.src}
            class="rounded-full w-full h-full object-cover"
            alt={'SNS'}
          />
        </div>
        <input
          class="hs-form-field__input w-fit grow"
          disabled={profileUpdating || !eoa}
          bind:value={profile.tiktokProfile}
        />
      </div>

      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6 overflow-hidden">
          <img
            src={Youtube.src}
            class="rounded-full w-full h-full object-cover"
            alt={'SNS'}
          />
        </div>
        <input
          class="hs-form-field__input w-fit grow"
          disabled={profileUpdating || !eoa}
          bind:value={profile.youtubeProfile}
        />
      </div>
    </div>
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label">
        {i18n('PassportSkin')} ({passportSkinItems?.length ?? 0})
      </span>
      <button
        disabled={!eoa ||
          !passportSkinItems.length ||
          profileFetching ||
          passportItemFetching ||
          profileUpdating}
        on:click|preventDefault={() => resetPassportSkinSelectedItems()}
        class="hs-button is-filled is-large w-fit text-center">Reset</button
      >
    </div>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if passportItemFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !passportItemFetching && !passportSkinItems?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PurchasePassportSkin')}
      </div>
    {:else if !passportItemFetching && passportSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each passportSkinItems as item, i}
          <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
            <button
              disabled={!eoa ||
                !passportSkinItems.length ||
                profileFetching ||
                passportItemFetching ||
                profileUpdating}
              on:click|preventDefault={() => selectPassportSkinItem(item)}
            >
              <PassportAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: isLocal,
                  classNames:
                    profile.skins?.at(0)?.theme === item.payload
                      ? 'border-2 border-surface-ink'
                      : 'border border-surface-300',
                }}
              />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label">
        {i18n('SelectedPassportClips')} ({profile?.skins?.at(0)?.clips
          ?.length ?? 0})
      </span>
      <button
        disabled={!eoa ||
          !passportNonSkinItems.length ||
          profileFetching ||
          passportItemFetching ||
          profileUpdating}
        on:click|preventDefault={() => resetPinnedNonSkinItems()}
        class="hs-button is-filled is-large w-fit text-center">Reset</button
      >
    </div>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if passportItemFetching || profileFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !passportItemFetching && !profileFetching && !profile.skins?.at(0)?.clips?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PinnPassportItems')}
      </div>
    {:else if !passportItemFetching && !profileFetching && profile.skins?.at(0)?.clips?.length && passportNonSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each profile.skins?.at(0)?.clips ?? [] as clip, i}
          <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
            <PassportAsset
              props={{
                item:
                  passportNonSkinItems.find((item) => item.payload === clip) ??
                  emptyPassportItem,
                provider: rpcProvider,
                local: isLocal,
              }}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </label>

  <!-- Passport items other than type: css | stylesheet-link -->
  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">
      {i18n('PassportAssets')} ({passportNonSkinItems?.length ?? 0})
    </span>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if passportItemFetching || profileFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !passportItemFetching && !profileFetching && !passportNonSkinItems?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PurchasePassportAssets')}
      </div>
    {:else if passportNonSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each passportNonSkinItems as item, i}
          <button
            on:click|preventDefault={() =>
              togglePinnnedPassortNonSkinItem(item)}
            disabled={!eoa ||
              !passportNonSkinItems.length ||
              profileFetching ||
              passportItemFetching ||
              profileUpdating}
          >
            <li id={`assets-${i.toString()}`} class="empty:hidden">
              <PassportAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: isLocal,
                  classNames: profile.skins
                    ?.at(0)
                    ?.clips?.includes(item.payload ?? '', 0)
                    ? 'border-2 border-black'
                    : 'border border-surface-300',
                }}
              />
            </li>
          </button>
        {/each}
      </ul>
    {/if}
  </label>

  {#if eoa === id}
    <button
      on:click={onSubmit}
      disabled={profileUpdating || !eoa || profileFetching}
      class={`mt-[76px] hs-button is-filled is-large w-fit ${
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
