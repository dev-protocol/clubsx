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
  let isCreatingNewSkin = false
  let profileFetching = true
  let profileUpdating = false
  let isSelectingAsDefaultSkin = false
  let passportItemsFetching = true
  let isTogglingSkinVisibility = false
  let profile: Profile = {} as Profile
  let profileFromAPI: Profile = profile
  let eoa: UndefinedOr<string> = undefined
  let purchasedSkinClips: PassportItem[] = []
  let purchasedSkinThemes: PassportItem[] = []
  let connection: UndefinedOr<typeof Connection> = undefined
  let updatingStatus: UndefinedOr<'success' | 'error'> = undefined

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
        console.error('Error occured while updating profile', err)
        updatingStatus = 'error'
        return
      })
      .finally(() => {
        profileUpdating = false
      })

    setTimeout(() => {
      window.location.reload(true)
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
    passportItemsFetching = true

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
        passportItemsFetching = false
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

  const createNewSkin = async () => {
    isCreatingNewSkin = true

    const newSkin: Skin = {
      id: nanoid(),
      name: `Profile no: ${(profileFromAPI?.skins?.length ?? 0) + 1}`,
      theme: '',
      clips: [],
      spotlight: [],
    }

    profile = {
      ...profileFromAPI,
      skins: [...(profileFromAPI.skins ?? []), newSkin],
    }
    await onSubmit()

    setTimeout(() => {
      window.location.href = `/passport/${eoa}/edit?skinId=${newSkin.id}`
      isCreatingNewSkin = false
    }, 3000)
  }

  const selectAsDefaultSkin = async () => {
    isSelectingAsDefaultSkin = true

    if (skinIndex === -1 || !profile?.skins?.at(skinIndex)) {
      isSelectingAsDefaultSkin = false
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

    setTimeout(() => {
      window.location.reload(true)
      isSelectingAsDefaultSkin = false
    }, 3000)
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

    setTimeout(() => {
      window.location.reload(true)
      isTogglingSkinVisibility = false
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
      isEditing={true}
      {eoa}
      skins={profile?.skins ?? []}
      selectedSkinId={skinId ?? profile?.skins?.at(0)?.id ?? ''}
    />

    <!-- Add new profile -->
    <button
      on:click|preventDefault={createNewSkin}
      disabled={profileFetching || profileUpdating || isCreatingNewSkin}
      class={`hs-button is-filled is-large w-fit text-center ${isCreatingNewSkin ? 'animate-pulse' : ''}`}
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
    {purchasedSkinThemes}
    purchasedSkinThemesFetching={passportItemsFetching}
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
    purchasedClips={purchasedSkinClips}
    isFetchingPurchasedClips={passportItemsFetching}
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
    isFetchingPurchasedClips={passportItemsFetching}
  />

  <!-- Edit page purchased clips -->
  <EditPagePurchasedClips
    {eoa}
    {isLocal}
    bind:profile
    bind:skinIndex
    {profileFetching}
    {profileUpdating}
    purchasedClips={purchasedSkinClips}
    isFetchingPurchasedClips={passportItemsFetching}
  />

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
        on:click|preventDefault={selectAsDefaultSkin}
        disabled={profileFetching ||
          profileUpdating ||
          isSelectingAsDefaultSkin}
        class={`hs-button is-filled is-large w-fit text-center ${isCreatingNewSkin ? 'animate-pulse' : ''}`}
        >{i18n('MakeDefaultProfile')}</button
      >

      <!-- Toggle profile visibility -->
      <button
        on:click|preventDefault={toggleSkinVisibility}
        disabled={profileFetching ||
          profileUpdating ||
          isTogglingSkinVisibility}
        class={`hs-button is-filled is-large w-fit text-center ${isCreatingNewSkin ? 'animate-pulse' : ''}`}
        >{profile?.skins?.at(skinIndex)?.isHidden
          ? i18n('ShowProfile')
          : i18n('HideProfile')}</button
      >
    </div>
  {/if}
</div>
