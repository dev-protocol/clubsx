<script lang="ts">
  import { nanoid } from 'nanoid'
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import { Strings } from '../i18n'
  import SkinSwitch from './SkinSwitch.svelte'
  import type { PassportItem } from '../types'
  import EditUserProfileInfo from './EditUserProfileInfo.svelte'
  import EditPassportSkinName from './EditPassportSkinName.svelte'
  import EditPassportSkinTheme from './EditPassportSkinTheme.svelte'
  import EditPagePurchasedClips from './EditPagePurchasedClips.svelte'
  import EditPassportSkinShowcase from './EditPassportSkinShowcase.svelte'
  import EditPassportSkinSpotlight from './EditPassportSkinSpotlight.svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let id: string
  export let skinId: string
  export let isLocal: boolean

  let skinIndex = 0
  let profileFetching = true
  let profileUpdating = false
  let isCreatingNewSkin = false
  let purchasedPassportIAssetsFetching = true
  let isSelectingAsDefaultSkin = false
  let isTogglingSkinVisibility = false
  let profile: Profile = {} as Profile
  let profileFromAPI: Profile = profile
  let eoa: UndefinedOr<string> = undefined
  let purchasedSkinClips: PassportItem[] = []
  let purchasedSkinThemes: PassportItem[] = []
  let hasSpotlightLimitReadched: boolean = false
  let updatingStatus: UndefinedOr<string> = undefined
  let createNewSkinStatus: UndefinedOr<string> = undefined
  let connection: UndefinedOr<typeof Connection> = undefined
  let selectAsDefaultSkinStatus: UndefinedOr<string> = undefined
  let toggleSkinVisibilityStatus: UndefinedOr<string> = undefined

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    _connectOnMount()
    _fetchProfile()
  })

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
        console.error('Error fetching profile', err)
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
  }

  const _fetchPassportItems = async () => {
    purchasedPassportIAssetsFetching = true

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
        console.error('Error fetching passport items', err)
        return []
      })
      .finally(() => {
        purchasedPassportIAssetsFetching = false
      })

    purchasedSkinThemes = fetchedPassportItems.filter(
      (item) =>
        item.itemAssetType === 'css' ||
        item.itemAssetType === 'stylesheet-link',
    )
    purchasedSkinClips = fetchedPassportItems.filter(
      (item) =>
        item.itemAssetType === 'image' ||
        item.itemAssetType === 'image-link' ||
        item.itemAssetType === 'short-video' ||
        item.itemAssetType === 'short-video-link',
    )
  }

  const submit = async (): Promise<string> => {
    const signer = connection ? connection().signer.getValue() : undefined
    if (!signer) {
      return 'error'
    }

    const hash = `Update profile: ${profile.username} @ts:${new Date().getTime()}`
    const sig = await signer
      .signMessage(hash)
      .then((sign) => sign)
      .catch(() => undefined)
    if (!sig) {
      return 'error'
    }

    const status: string = await fetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify({ profile, hash, sig }),
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

    return status
  }

  const saveProfile = async () => {
    profileUpdating = true
    updatingStatus = await submit()
    profileUpdating = false

    setTimeout(() => {
      const isReqSuccessful = updatingStatus === 'success'
      updatingStatus = undefined
      if (isReqSuccessful) {
        location.reload()
      }
    }, 3000)
  }

  const createNewSkin = async () => {
    isCreatingNewSkin = true
    const newSkin: Skin = {
      theme: '',
      clips: [],
      id: nanoid(),
      spotlight: [],
      name: `Profile no: ${(profileFromAPI?.skins?.length ?? 0) + 1}`,
    }
    profile = {
      ...profileFromAPI,
      skins: [...(profileFromAPI.skins ?? []), newSkin],
    }
    createNewSkinStatus = await submit()
    isCreatingNewSkin = false

    setTimeout(() => {
      const isReqSuccessful = createNewSkinStatus === 'success'
      createNewSkinStatus = undefined
      if (isReqSuccessful) {
        window.location.href = `/passport/${eoa}/edit?skinId=${newSkin.id}`
      }
    }, 3000)
  }

  const selectAsDefaultSkin = async () => {
    isSelectingAsDefaultSkin = true
    if (skinIndex === -1 || !profile?.skins?.at(skinIndex)) {
      isSelectingAsDefaultSkin = false
      selectAsDefaultSkinStatus = 'error'
      setTimeout(() => {
        selectAsDefaultSkinStatus = undefined
      }, 3000)
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
    selectAsDefaultSkinStatus = await submit()
    isSelectingAsDefaultSkin = false

    setTimeout(() => {
      const isReqSuccessful = selectAsDefaultSkinStatus === 'success'
      selectAsDefaultSkinStatus = undefined
      if (isReqSuccessful) {
        window.location.reload()
      }
    }, 3000)
  }

  const toggleSkinVisibility = async () => {
    isTogglingSkinVisibility = true
    if (skinIndex === -1 || !profile?.skins?.at(skinIndex)) {
      isTogglingSkinVisibility = false
      toggleSkinVisibilityStatus = 'error'
      setTimeout(() => {
        selectAsDefaultSkinStatus = undefined
      }, 3000)
      return
    }
    if (skinIndex === 0) {
      isTogglingSkinVisibility = false
      toggleSkinVisibilityStatus = 'error'
      setTimeout(() => {
        selectAsDefaultSkinStatus = undefined
      }, 3000)
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
    toggleSkinVisibilityStatus = await submit()
    isTogglingSkinVisibility = false

    setTimeout(() => {
      const isReqSuccessful = toggleSkinVisibilityStatus === 'success'
      toggleSkinVisibilityStatus = undefined
      if (isReqSuccessful) {
        window.location.reload()
      }
    }, 3000)
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
      {eoa}
      isEditing={true}
      skins={profile?.skins ?? []}
      selectedSkinId={skinId ?? profile?.skins?.at(0)?.id ?? ''}
    />

    <!-- Add new profile -->
    <button
      on:click|preventDefault={createNewSkin}
      disabled={profileFetching || profileUpdating || isCreatingNewSkin}
      class={`hs-button is-filled w-fit text-center ${isCreatingNewSkin ? 'animate-pulse' : ''} ${
        createNewSkinStatus === 'success'
          ? 'is-success'
          : createNewSkinStatus === 'error'
            ? 'is-error'
            : ''
      }`}
    >
      {isCreatingNewSkin
        ? i18n('Saving')
        : createNewSkinStatus === 'success'
          ? i18n('Saved')
          : createNewSkinStatus === 'error'
            ? i18n('Error')
            : i18n('AddNewProfile')}
    </button>
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
    {purchasedSkinThemes}
    purchasedSkinThemesFetching={purchasedPassportIAssetsFetching}
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
    {hasSpotlightLimitReadched}
    purchasedClips={purchasedSkinClips}
    isFetchingPurchasedClips={purchasedPassportIAssetsFetching}
  />

  <!-- Passport skin showcase -->
  <EditPassportSkinShowcase
    {eoa}
    {isLocal}
    bind:profile
    bind:skinIndex
    {profileFromAPI}
    {profileFetching}
    {profileUpdating}
    purchasedClips={purchasedSkinClips}
    isFetchingPurchasedClips={purchasedPassportIAssetsFetching}
  />

  <!-- Edit page purchased clips -->
  <EditPagePurchasedClips
    {eoa}
    {isLocal}
    bind:profile
    bind:skinIndex
    {profileFetching}
    {profileUpdating}
    {hasSpotlightLimitReadched}
    purchasedClips={purchasedSkinClips}
    isFetchingPurchasedClips={purchasedPassportIAssetsFetching}
  />

  {#if eoa === id}
    <div
      class="my-[76px] flex w-full max-w-full items-center justify-start gap-2"
    >
      <button
        on:click={saveProfile}
        disabled={profileUpdating || !eoa || profileFetching}
        class={`hs-button is-filled is-large w-fit ${profileUpdating ? 'animate-pulse' : ''} ${
          updatingStatus === 'success'
            ? 'is-success'
            : updatingStatus === 'error'
              ? 'is-error'
              : ''
        }`}
        >{profileUpdating
          ? i18n('Saving')
          : updatingStatus === 'success'
            ? i18n('Saved')
            : updatingStatus === 'error'
              ? i18n('Error')
              : i18n('Save')}</button
      >

      <!-- Make this profile default -->
      <button
        on:click|preventDefault={selectAsDefaultSkin}
        disabled={profileFetching ||
          profileUpdating ||
          isSelectingAsDefaultSkin}
        class={`hs-button is-filled is-large w-fit text-center ${isSelectingAsDefaultSkin ? 'animate-pulse' : ''} ${
          selectAsDefaultSkinStatus === 'success'
            ? 'is-success'
            : selectAsDefaultSkinStatus === 'error'
              ? 'is-error'
              : ''
        }`}
        >{isSelectingAsDefaultSkin
          ? i18n('Saving')
          : selectAsDefaultSkinStatus === 'success'
            ? i18n('Saved')
            : selectAsDefaultSkinStatus === 'error'
              ? i18n('Error')
              : i18n('MakeDefaultProfile')}</button
      >

      <!-- Toggle profile visibility -->
      <button
        on:click|preventDefault={toggleSkinVisibility}
        disabled={profileFetching ||
          profileUpdating ||
          isTogglingSkinVisibility ||
          skinIndex === 0}
        class={`hs-button is-filled is-large w-fit text-center ${isTogglingSkinVisibility ? 'animate-pulse' : ''} ${
          toggleSkinVisibilityStatus === 'success'
            ? 'is-success'
            : toggleSkinVisibilityStatus === 'error'
              ? 'is-error'
              : ''
        }`}
      >
        {isTogglingSkinVisibility
          ? i18n('Saving')
          : toggleSkinVisibilityStatus === 'success'
            ? i18n('Saved')
            : toggleSkinVisibilityStatus === 'error'
              ? i18n('Error')
              : profile?.skins?.at(skinIndex)?.isHidden
                ? i18n('ShowProfile')
                : i18n('HideProfile')}
      </button>
    </div>
  {/if}
</div>
