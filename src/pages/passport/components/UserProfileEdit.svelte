<script lang="ts">
  import { nanoid } from 'nanoid'
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { fade } from 'svelte/transition'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Clip, Profile, Skin } from '@pages/api/profile'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { Modals, closeAllModals, closeModal, openModal } from 'svelte-modals'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import { Strings } from '../i18n'
  import SkinSwitch from './SkinSwitch.svelte'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import EditUserProfileInfo from './EditUserProfileInfo.svelte'
  import EditPassportSkinName from './EditPassportSkinName.svelte'
  import EditPassportSkinTheme from './EditPassportSkinTheme.svelte'
  import PassportClipEditModal from './PassportClipEditModal.svelte'
  import EditPassportSkinSpotlight from './EditPassportSkinSpotlight.svelte'

  const i18nBase = i18nFactory(Strings)

  export let skinId: string
  export let id: string
  export let isLocal: boolean

  let skinIndex = 0
  let isAddingProfile = false
  let profileFetching = true
  let i18n = i18nBase(['en'])
  let avatarUploading = false
  let profileUpdating = false
  let passportItemFetching = true
  let isMakingDefaultSkin = false
  let isTogglingSkinVisibility = false
  let profile: Profile = {} as Profile
  let profileFromAPI: Profile = profile
  let passportSkinItems: PassportItem[] = []
  let passportNonSkinItems: PassportItem[] = []
  let passportItemsFromAPI: PassportItem[] = []
  let eoa: UndefinedOr<string> = undefined
  let connection: UndefinedOr<typeof Connection> = undefined
  let updatingStatus: UndefinedOr<'success' | 'error'> = undefined
  let isDisplayingHint: boolean = false
  let timeoutToHint: UndefinedOr<NodeJS.Timeout> = undefined
  let hasSpotlightLimitReadched: boolean = false

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

  const addProfile = async () => {
    isAddingProfile = true

    const newProfile = {
      id: nanoid(),
      name: `Profile no: ${(profileFromAPI?.skins?.length ?? 0) + 1}`,
      theme: '',
      clips: [],
      spotlight: [],
    }
    profile = {
      ...profileFromAPI,
      skins: [...(profileFromAPI.skins ?? []), newProfile],
    }

    await onSubmit()

    setTimeout(() => {
      isAddingProfile = false
      window.location.href = `/passport/${eoa}/edit?skinId=${newProfile.id}`
    }, 3000)
  }

  const makeDefaultSkin = async () => {
    isMakingDefaultSkin = true

    if (skinIndex === -1) {
      isMakingDefaultSkin = false
      return
    }

    profile = {
      ...profileFromAPI,
      skins: [
        {
          ...profile.skins!.at(skinIndex)!,
        },
        ...(profile?.skins?.filter((skin) => skin.id !== skinId) ?? []),
      ],
    }

    await onSubmit()
    isMakingDefaultSkin = false
  }

  const toggleSkinVisibility = async () => {
    isTogglingSkinVisibility = true

    if (skinIndex === -1 || !profile?.skins?.at(skinIndex)) {
      isTogglingSkinVisibility = false
      return
    }

    if (skinIndex === 0) {
      // TODO: add error saying cannot toggle default skin.
      isTogglingSkinVisibility = false
      return
    }

    profile = {
      ...profileFromAPI,
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...profile.skins!.at(skinIndex)!,
          isHidden: !profile.skins?.at(skinIndex)?.isHidden,
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    await onSubmit()
    isTogglingSkinVisibility = false
  }

  const onChangePassportSkinName = (ev: Event) => {
    const newName =
      (event?.target as HTMLInputElement)?.value ??
      profile?.skins?.at(skinIndex)?.name ??
      profileFromAPI?.skins?.at(skinIndex)?.name ??
      ''

    profile = {
      ...profile,
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          name: newName,
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }
  }

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
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          theme: item.payload, // Update only theme value.
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
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
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.

          // Reset only theme value below.
          ...(profileFromAPI?.skins?.length && // If profileFromAPI, skins, skins.length, skins.at, thme any return falsy we get empty value.
          profileFromAPI?.skins?.at(skinIndex)?.theme
            ? { theme: profileFromAPI.skins[skinIndex].theme } // Since we have validated all- profileFromAPI, skins, skins.length > 0, skins.at(0), theme
            : {}), // Otherwise set it to empty
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    console.log('Profile at reseting passport skin item', profile)
  }

  const toggleClipInSpotlight = async (item: PassportItem) => {
    if (!item.payload) {
      console.log(
        `Passport clip not pinned to spotlight since item.payload missing`,
        item.id,
      )
      return
    }

    const isClipInSpotlight = !!profile?.skins
      ?.at(skinIndex)
      ?.spotlight?.find((clip) => clip.payload === item.payload)

    // If the clip is not already present in the spotlight, that means we are adding it, so we need
    // to check for spotlight?.length <= 3.
    if (
      !isClipInSpotlight && // not in spotlight
      (profile?.skins?.at(skinIndex)?.spotlight?.length ?? 0) > 2 // spotlight?.length <= 3.
    ) {
      hasSpotlightLimitReadched = true
      return
    }
    hasSpotlightLimitReadched = false

    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        // Set skins to the updated value or append new value of theme.
        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          spotlight: profile?.skins
            ?.at(skinIndex)
            ?.spotlight?.find((clip) => clip.payload === item.payload)
            ? [
                ...(profile.skins
                  ?.at(skinIndex)
                  ?.spotlight?.filter(
                    (clip) => clip.payload !== item.payload,
                  ) ?? []),
              ]
            : [
                ...(profile.skins?.at(skinIndex)?.spotlight ?? []),
                { payload: item.payload, description: '', frameColorHex: '' },
              ],
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    console.log('Profile', profile)

    console.log(
      'Passort item and profile at pinning passport clips to spotlight',
      item,
      profile,
    )
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
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        // Set skins to the updated value or append new value of theme.
        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          clips: profile?.skins
            ?.at(skinIndex)
            ?.clips?.find((clip) => clip.payload === item.payload)
            ? [
                ...(profile.skins
                  ?.at(skinIndex)
                  ?.clips?.filter((clip) => clip.payload !== item.payload) ??
                  []),
              ]
            : [
                ...(profile.skins?.at(skinIndex)?.clips ?? []),
                { payload: item.payload, description: '', frameColorHex: '' },
              ],
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    console.log(
      'Passort item and profile at pinning passport non skin item',
      item,
      profile,
    )
  }

  const resetSpotlightClips = async () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties ir-respective of whether the skin is modified or not.
          spotlight: profileFromAPI?.skins?.at(skinIndex)?.spotlight ?? [], // Retain clips from profileFromAPI if present otherwise empty array.
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    console.log('Profile at resetting spotlight', profile)
  }

  const resetPinnedNonSkinItems = async () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties ir-respective of whether the skin is modified or not.
          clips: profileFromAPI?.skins?.at(skinIndex)?.clips ?? [], // Retain clips from profileFromAPI if present otherwise empty array.
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }

    console.log('Profile at resetting pinned non skin item', profile)
  }

  const onEditShowcaseClip = (item: PassportItem) => {
    if (
      !profile?.skins
        ?.at(skinIndex)
        ?.clips?.find((clip) => clip.payload === item.payload)
    ) {
      console.error(
        'Clip not found in profile showcase when trying to edit it.',
        item.id,
      )
      return
    }

    openModal(PassportClipEditModal, {
      item: item,
      hex: profile?.skins
        ?.at(skinIndex)
        ?.clips?.find((clip) => clip.payload === item.payload)?.frameColorHex,
      description:
        profile?.skins
          ?.at(skinIndex)
          ?.clips?.find((clip) => clip.payload === item.payload)?.description ??
        '',
      onClose: async () => {
        closeAllModals()
      },
      closeAllOnFinished: true,
      action: async (
        clip: PassportItem,
        description: string,
        frameColorHex: string,
      ): Promise<boolean> => {
        if (
          !profile?.skins
            ?.at(skinIndex)
            ?.clips?.find((clip) => clip.payload === item.payload)
        ) {
          console.error(
            'Clip not found in profile showcase when trying to edit it.',
            item.id,
          )
          return false
        }

        if (clip.payload !== item.payload) {
          console.error(
            'Clip mismatch when trying to edit it.',
            item.id,
            clip.id,
          )
          return false
        }

        try {
          profile = {
            ...profile, // Retain other modified fields.
            skins: [
              ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

              // Set skins to the updated value or append new value of theme.
              {
                ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
                clips: [
                  ...(profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.filter((clip) => clip.payload !== item.payload) ??
                    ([] as Clip[])),
                  {
                    payload: item.payload!,
                    description,
                    frameColorHex,
                  },
                ],
              },

              ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
            ],
          }
          return true
        } catch (e) {
          return false
        }
      },
    })
  }

  const onEditSpotlightClip = (item: PassportItem) => {
    if (
      !profile?.skins
        ?.at(skinIndex)
        ?.spotlight?.find((clip) => clip.payload === item.payload)
    ) {
      console.error(
        'Clip not found in profile spotlight when trying to edit it.',
        item.id,
      )
      return
    }

    openModal(PassportClipEditModal, {
      item: item,
      hex: profile?.skins
        ?.at(skinIndex)
        ?.spotlight?.find((clip) => clip.payload === item.payload)
        ?.frameColorHex,
      description:
        profile?.skins
          ?.at(skinIndex)
          ?.spotlight?.find((clip) => clip.payload === item.payload)
          ?.description ?? '',
      onClose: async () => {
        closeAllModals()
      },
      closeAllOnFinished: true,
      action: async (
        clip: PassportItem,
        description: string,
        frameColorHex: string,
      ): Promise<boolean> => {
        if (
          !profile?.skins
            ?.at(skinIndex)
            ?.spotlight?.find((clip) => clip.payload === item.payload)
        ) {
          console.error(
            'Clip not found in profile spotlight when trying to edit it.',
            item.id,
          )
          return false
        }

        if (clip.payload !== item.payload) {
          console.error(
            'Clip mismatch when trying to edit it.',
            item.id,
            clip.id,
          )
          return false
        }

        try {
          profile = {
            ...profile, // Retain other modified fields.
            skins: [
              ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

              // Set skins to the updated value or append new value of theme.
              {
                ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
                spotlight: [
                  ...(profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.filter(
                      (clip) => clip.payload !== item.payload,
                    ) ?? ([] as Clip[])),
                  {
                    payload: item.payload!,
                    description,
                    frameColorHex,
                  },
                ],
              },

              ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
            ],
          }
          return true
        } catch (e) {
          return false
        }
      },
    })
  }

  const onClickBackdrop = () => {
    /**
     * Define the action when clicking the modal backdrop.
     */
    if (timeoutToHint !== undefined) {
      clearTimeout(timeoutToHint)
      timeoutToHint = undefined
    }

    if (isDisplayingHint) {
      closeModal()
      isDisplayingHint = false
      return
    }

    closeAllModals()
  }

  $: {
    // Generate an id for skins.at(0) only if it is present but without an id.
    if (profile?.skins?.length && !profile.skins.at(0)?.id) {
      profile = {
        ...profile,
        skins: [
          {
            ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
            id: nanoid(),
          },
          ...(profile?.skins?.slice(1) ?? []), // Retain all the other skins.
        ],
      }
    }

    const index = profile?.skins?.findIndex((skin) => skin.id === skinId) ?? 0
    skinIndex = index === -1 ? 0 : index
  }
</script>

<div class="w-full">
  <div
    class="w-fit max-w-full flex gap-[15px] py-[8px] px-[16px] items-center justify-start"
  >
    <SkinSwitch
      isEditing={true}
      {eoa}
      skins={profile?.skins ?? []}
      selectedSkinId={skinId ?? profile?.skins?.at(0)?.id ?? ''}
    />

    <!-- Add new profile -->
    <button
      on:click|preventDefault={addProfile}
      disabled={profileFetching || profileUpdating || isAddingProfile}
      class={`hs-button is-filled is-large w-fit text-center ${isAddingProfile ? 'animate-pulse' : ''}`}
      >{i18n('AddNewProfile')}</button
    >
  </div>

  <!-- Profile info edit -->
  <EditUserProfileInfo {eoa} bind:profile {profileUpdating} />

  <!-- Passport skin name -->
  <EditPassportSkinName
    {eoa}
    bind:profile
    bind:skinIndex
    {profileFromAPI}
    {profileFetching}
    {profileUpdating}
  />

  <!-- Passport skin theme -->
  <EditPassportSkinTheme
    {eoa}
    {isLocal}
    bind:profile
    bind:skinIndex
    {profileFromAPI}
    {profileFetching}
    {profileUpdating}
    {passportSkinItems}
    passportItemsFetching={passportItemFetching}
  />

  <!-- Passport skin spotlight -->
  <EditPassportSkinSpotlight
    {eoa}
    {isLocal}
    bind:profile
    bind:skinIndex
    {profileFromAPI}
    {profileFetching}
    {profileUpdating}
    {passportNonSkinItems}
    passportItemsFetching={passportItemFetching}
  />

  <!-- Showcase/pinned clips -->
  <span class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label">
        {i18n('PassportShowcaseClips')} ({profile?.skins?.at(skinIndex)?.clips
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
    {:else if !passportItemFetching && !profileFetching && !profile.skins?.at(skinIndex)?.clips?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PinClipsToShowcase')}
      </div>
    {:else if !passportItemFetching && !profileFetching && profile.skins?.at(skinIndex)?.clips?.length && passportNonSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each passportNonSkinItems as item, i}
          {#if item.payload && profile?.skins
              ?.at(skinIndex)
              ?.clips?.find((clip) => clip.payload === item.payload)}
            <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
              <PassportAsset
                props={((clip) => ({
                  item: item,
                  provider: rpcProvider,
                  local: isLocal,
                  isEditable: true,
                  editAction: () => onEditShowcaseClip(item),
                  description: clip?.description,
                  frameColorHex: clip?.frameColorHex,
                }))(
                  profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.find((clip) => clip.payload === item.payload),
                )}
              />
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </span>

  <!-- Passport items other than type: css | stylesheet-link -->
  <span class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">
      {i18n('PassportClips')} ({passportNonSkinItems?.length ?? 0})
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
        {i18n('Empty')} :) <br />{@html i18n('PurchasePassportClips')}
      </div>
    {:else if passportNonSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each passportNonSkinItems as item, i}
          <li id={`assets-${i.toString()}`} class="relative group empty:hidden">
            <div
              class="h-fit w-full max-w-full absolute left-0 right-0 top-0 hidden group-hover:flex flex-row items-center justify-end bg-surface-300 rounded-md p-4 gap-4 opacity-90"
            >
              <!-- Add to spotlight -->
              <button
                class="w-6 h-6 cursor-pointer"
                on:click|preventDefault={() => toggleClipInSpotlight(item)}
                disabled={!eoa ||
                  !passportNonSkinItems.length ||
                  profileFetching ||
                  passportItemFetching ||
                  profileUpdating}
              >
                <!-- Spotlight -->
                <svg
                  id="Layer_1"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  width="24"
                  height="24"
                  fill={profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.find((clip) => clip.payload === item.payload)
                    ? '#FFB602'
                    : 'none'}
                  stroke={profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.find((clip) => clip.payload === item.payload)
                    ? '#FFB602'
                    : 'currentColor'}
                  color="currentColor"
                  ><defs
                    ><style>
                      .cls-63762d3cc3a86d32eae6efea-1 {
                        stroke-miterlimit: 10;
                      }
                    </style></defs
                  >
                  <polygon
                    class="cls-63762d3cc3a86d32eae6efea-1"
                    points="12 2.49 15.51 8.17 22 9.76 17.68 14.85 18.18 21.51 12 18.98 5.82 21.51 6.32 14.85 2 9.76 8.49 8.17 12 2.49"
                  ></polygon>
                </svg>
              </button>

              <!-- Add to showcase/pinned clips -->
              <button
                class="w-6 h-6 cursor-pointer"
                on:click|preventDefault={() =>
                  togglePinnnedPassortNonSkinItem(item)}
                disabled={!eoa ||
                  !passportNonSkinItems.length ||
                  profileFetching ||
                  passportItemFetching ||
                  profileUpdating}
              >
                <!-- Showcase -->
                <svg
                  id="Layer_1"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  width="24"
                  height="24"
                  fill={profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.find((clip) => clip.payload === item.payload)
                    ? '#DB0125'
                    : 'none'}
                  stroke={profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.find((clip) => clip.payload === item.payload)
                    ? '#DB0125'
                    : 'currentColor'}
                  color="currentColor"
                  ><defs
                    ><style>
                      .cls-637b83faf95e86b59c57a0f7-1 {
                        fill: currentColor;
                      }
                      .cls-637b83faf95e86b59c57a0f7-2 {
                        stroke-miterlimit: 10;
                      }
                    </style></defs
                  ><polygon
                    class="cls-637b83faf95e86b59c57a0f7-1"
                    points="2.77 20.53 8.78 13.81 10.19 15.22 3.47 21.23 2.77 20.53 2.77 20.53"
                  ></polygon><path
                    class="cls-637b83faf95e86b59c57a0f7-2"
                    d="M13.73,18.76,5.24,10.27A5.94,5.94,0,0,1,9.48,8.52,5.42,5.42,0,0,1,11,8.73L14.5,5.26a1.49,1.49,0,0,1,2-2,1.32,1.32,0,0,1,.42.29l3.53,3.53a1.32,1.32,0,0,1,.29.42,1.49,1.49,0,0,1-2,2L15.27,13a5.42,5.42,0,0,1,.21,1.55A5.94,5.94,0,0,1,13.73,18.76Z"
                  ></path></svg
                >
              </button>
            </div>
            <PassportAsset
              props={{
                item,
                provider: rpcProvider,
                local: isLocal,
                classNames:
                  profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.find((clip) => clip.payload === item.payload) ||
                  profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.find((clip) => clip.payload === item.payload)
                    ? 'border-2 border-surface-ink'
                    : 'border border-surface-300',
              }}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </span>

  {#if eoa === id}
    <div
      class="my-[76px] flex w-full max-w-full items-center justify-start gap-2"
    >
      <button
        on:click={onSubmit}
        disabled={profileUpdating || !eoa || profileFetching}
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

      <!-- Make this profile default -->
      <button
        on:click|preventDefault={makeDefaultSkin}
        disabled={profileFetching || profileUpdating || isMakingDefaultSkin}
        class={`hs-button is-filled is-large w-fit text-center ${isAddingProfile ? 'animate-pulse' : ''}`}
        >{i18n('MakeDefaultProfile')}</button
      >

      <!-- Toggle profile visibility -->
      <button
        on:click|preventDefault={toggleSkinVisibility}
        disabled={profileFetching ||
          profileUpdating ||
          isTogglingSkinVisibility}
        class={`hs-button is-filled is-large w-fit text-center ${isAddingProfile ? 'animate-pulse' : ''}`}
        >{profile?.skins?.at(skinIndex)?.isHidden
          ? i18n('ShowProfile')
          : i18n('HideProfile')}</button
      >
    </div>
  {/if}
</div>

<Modals>
  <div
    slot="backdrop"
    class="fixed inset-0 bg-black/50"
    transition:fade={{ duration: 100 }}
    on:click={onClickBackdrop}
  />
</Modals>
