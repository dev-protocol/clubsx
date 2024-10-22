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
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import PassportClipEditModal from './PassportClipEditModal.svelte'

  const i18nBase = i18nFactory(Strings)

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
  let isDisplayingHint: boolean = false
  let timeoutToHint: UndefinedOr<NodeJS.Timeout> = undefined

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

  const addProfile = async () => {}

  const onChangePassportSkinName = (ev: Event) => {
    const newName =
      (event?.target as HTMLInputElement)?.value ??
      profile?.skins?.at(0)?.name ??
      profileFromAPI?.skins?.at(0)?.name ??
      ''

    profile = {
      ...profile,
      skins: [
        {
          ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          name: newName,
        },
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
        {
          ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          theme: item.payload, // Update only theme value.
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
      skins: [
        {
          ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.

          // Reset only theme value below.
          ...(profileFromAPI?.skins?.length && // If profileFromAPI, skins, skins.length, skins.at, thme any return falsy we get empty value.
          profileFromAPI?.skins?.at(0)?.theme
            ? { theme: profileFromAPI.skins[0].theme } // Since we have validated all- profileFromAPI, skins, skins.length > 0, skins.at(0), theme
            : {}), // Otherwise set it to empty
        },
      ],
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
          ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          clips: profile?.skins
            ?.at(0)
            ?.clips?.find((clip) => clip.payload === item.payload)
            ? [
                ...(profile.skins
                  ?.at(0)
                  ?.clips?.filter((clip) => clip.payload !== item.payload) ??
                  []),
              ]
            : [
                ...(profile.skins?.at(0)?.clips ?? []),
                { payload: item.payload, description: '', frameColorHex: '' },
              ],
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
      skins: [
        {
          ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties ir-respective of whether the skin is modified or not.
          clips: profileFromAPI?.skins?.at(0)?.clips ?? [], // Retain clips from profileFromAPI if present otherwise empty array.
        },
      ],
    }

    console.log('Profile at resetting pinned non skin item', profile)
  }

  const onEditClip = (item: PassportItem) => {
    if (
      !profile?.skins
        ?.at(0)
        ?.clips?.find((clip) => clip.payload === item.payload)
    ) {
      console.error(
        'Clip not found in profile when trying to edit it.',
        item.id,
      )
      return
    }

    openModal(PassportClipEditModal, {
      item: item,
      hex: profile?.skins
        ?.at(0)
        ?.clips?.find((clip) => clip.payload === item.payload)?.frameColorHex,
      description:
        profile?.skins
          ?.at(0)
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
            ?.at(0)
            ?.clips?.find((clip) => clip.payload === item.payload)
        ) {
          console.error(
            'Clip not found in profile when trying to edit it.',
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
              // Set skins to the updated value or append new value of theme.
              {
                ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
                clips: [
                  ...(profile?.skins
                    ?.at(0)
                    ?.clips?.filter((clip) => clip.payload !== item.payload) ??
                    ([] as Clip[])),
                  {
                    payload: item.payload!,
                    description,
                    frameColorHex,
                  },
                ],
              },
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
    // generate id only once (i.e when profile or skins or skins(0) or skins(0).id is not present)
    if (!profileFromAPI?.skins?.at(0)?.id) {
      profile = {
        ...profile,
        skins: [
          {
            ...(profile?.skins?.at(0) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
            id: nanoid(),
          },
        ],
      }
    }
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
      placeholder={i18n('UsernamePlaceholder')}
    />
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label"> {i18n('Description')} </span>
    <textarea
      class="hs-form-field__input"
      bind:value={profile.description}
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

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">SNS</span>
    <div
      class="w-[55%] max-w-full flex flex-col gap-2.5 items-start justify-center"
    >
      <!-- X -->
      <div class="w-full max-w-full flex items-center justify-start gap-5">
        <div class="relative w-6 h-6">
          <svg
            class="h-6 w-6"
            width="25"
            height="23"
            viewBox="0 0 25 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4455_5459)">
              <path
                d="M19.1682 0.700195H22.9002L14.7468 10.0193L24.3389 22.7002H16.8281L10.9459 15.0091L4.21504 22.7002H0.48055L9.20142 12.7325L0 0.700195H7.70092L13.0182 7.72994L19.1682 0.700195ZM17.8583 20.4662H19.9264L6.57734 2.81687H4.35832L17.8583 20.4662Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_4455_5459">
                <rect
                  width="24.3389"
                  height="22"
                  fill="white"
                  transform="translate(0 0.700195)"
                />
              </clipPath>
            </defs>
          </svg>
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
          <svg
            class="w-6 h-6"
            width="19"
            height="23"
            viewBox="0 0 19 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4455_5467)">
              <path
                d="M17.2859 10.3143L14.1429 13.4573H10.9999L8.24994 16.2072V13.4573H4.71436V1.67188H17.2859V10.3143Z"
                fill="#FEFEFE"
              />
              <path
                d="M17.2858 10.3147L14.1428 13.4577H10.9998L8.24984 16.2077V13.4577H4.71426V1.67229H17.2858V10.3147ZM3.92862 0.100586L0 4.0292V18.172H4.71426V22.1006L8.64288 18.172H11.7854L18.857 11.1004V0.100586H3.92862Z"
                fill="#7E5AA1"
              />
              <path
                d="M13.3571 9.13613H14.9283V4.42188H13.3571V9.13613ZM9.0354 9.13613H10.6071V4.42188H9.0354V9.13613Z"
                fill="#7E5AA1"
              />
            </g>
            <defs>
              <clipPath id="clip0_4455_5467">
                <rect
                  width="18.857"
                  height="22"
                  fill="white"
                  transform="translate(0 0.100586)"
                />
              </clipPath>
            </defs>
          </svg>
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
          <svg
            class="w-6 h-6"
            width="22"
            height="23"
            viewBox="0 0 22 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4455_5496)">
              <path
                d="M11.0056 0.666992C6.48198 0.666992 5.15898 0.671659 4.90182 0.692992C3.97349 0.770159 3.39582 0.916326 2.76649 1.22966C2.28149 1.47049 1.89899 1.74966 1.52149 2.14099C0.833988 2.85466 0.417322 3.73266 0.266489 4.77633C0.193155 5.283 0.171822 5.38633 0.167489 7.97433C0.165822 8.837 0.167489 9.97233 0.167489 11.4952C0.167489 16.0152 0.172489 17.3368 0.194155 17.5935C0.269155 18.4968 0.410822 19.0652 0.710822 19.6868C1.28415 20.8768 2.37915 21.7702 3.66915 22.1035C4.11582 22.2185 4.60915 22.2818 5.24249 22.3118C5.51082 22.3235 8.24582 22.3318 10.9825 22.3318C13.7191 22.3318 16.4558 22.3285 16.7175 22.3152C17.4508 22.2807 17.8766 22.2235 18.3475 22.1018C19.6458 21.7668 20.7208 20.8868 21.3058 19.6802C21.6 19.0735 21.7491 18.4835 21.8166 17.6273C21.8313 17.4407 21.8375 14.4645 21.8375 11.4923C21.8375 8.51967 21.8308 5.549 21.8161 5.36233C21.7478 4.49233 21.5986 3.90733 21.295 3.28899C21.0458 2.78283 20.7691 2.40483 20.3675 2.01833C19.6506 1.33366 18.774 0.916992 17.7293 0.766326C17.2231 0.693159 17.1223 0.671492 14.5323 0.666992H11.0056Z"
                fill="url(#paint0_radial_4455_5496)"
              />
              <path
                d="M11.0056 0.666992C6.48198 0.666992 5.15898 0.671659 4.90182 0.692992C3.97349 0.770159 3.39582 0.916326 2.76649 1.22966C2.28149 1.47049 1.89899 1.74966 1.52149 2.14099C0.833988 2.85466 0.417322 3.73266 0.266489 4.77633C0.193155 5.283 0.171822 5.38633 0.167489 7.97433C0.165822 8.837 0.167489 9.97233 0.167489 11.4952C0.167489 16.0152 0.172489 17.3368 0.194155 17.5935C0.269155 18.4968 0.410822 19.0652 0.710822 19.6868C1.28415 20.8768 2.37915 21.7702 3.66915 22.1035C4.11582 22.2185 4.60915 22.2818 5.24249 22.3118C5.51082 22.3235 8.24582 22.3318 10.9825 22.3318C13.7191 22.3318 16.4558 22.3285 16.7175 22.3152C17.4508 22.2807 17.8766 22.2235 18.3475 22.1018C19.6458 21.7668 20.7208 20.8868 21.3058 19.6802C21.6 19.0735 21.7491 18.4835 21.8166 17.6273C21.8313 17.4407 21.8375 14.4645 21.8375 11.4923C21.8375 8.51967 21.8308 5.549 21.8161 5.36233C21.7478 4.49233 21.5986 3.90733 21.295 3.28899C21.0458 2.78283 20.7691 2.40483 20.3675 2.01833C19.6506 1.33366 18.774 0.916992 17.7293 0.766326C17.2231 0.693159 17.1223 0.671492 14.5323 0.666992H11.0056Z"
                fill="url(#paint1_radial_4455_5496)"
              />
              <path
                d="M11.0007 3.5C8.828 3.5 8.55533 3.5095 7.702 3.54833C6.85033 3.58733 6.269 3.72217 5.76033 3.92C5.23417 4.12433 4.78783 4.39767 4.34317 4.8425C3.89817 5.28717 3.62483 5.7335 3.41983 6.2595C3.2215 6.76833 3.0865 7.34983 3.04817 8.20117C3.01 9.0545 3 9.32734 3 11.5C3 13.6727 3.00967 13.9445 3.04833 14.7978C3.0875 15.6495 3.22233 16.2308 3.42 16.7395C3.6245 17.2657 3.89783 17.712 4.34267 18.1567C4.78717 18.6017 5.2335 18.8757 5.75933 19.08C6.26833 19.2778 6.84983 19.4127 7.70133 19.4517C8.55466 19.4905 8.82716 19.5 10.9997 19.5C13.1725 19.5 13.4443 19.4905 14.2977 19.4517C15.1493 19.4127 15.7313 19.2778 16.2403 19.08C16.7663 18.8757 17.212 18.6017 17.6565 18.1567C18.1015 17.712 18.3748 17.2657 18.5798 16.7397C18.7765 16.2308 18.9115 15.6493 18.9515 14.798C18.9898 13.9447 18.9998 13.6727 18.9998 11.5C18.9998 9.32734 18.9898 9.05467 18.9515 8.20133C18.9115 7.34967 18.7765 6.76833 18.5798 6.25967C18.3748 5.7335 18.1015 5.28717 17.6565 4.8425C17.2115 4.3975 16.7665 4.12417 16.2398 3.92C15.7298 3.72217 15.1482 3.58733 14.2965 3.54833C13.4432 3.5095 13.1715 3.5 10.9982 3.5H11.0007ZM10.283 4.94167C10.496 4.94133 10.7337 4.94167 11.0007 4.94167C13.1367 4.94167 13.3898 4.94933 14.2333 4.98767C15.0133 5.02333 15.4367 5.15367 15.7187 5.26317C16.092 5.40817 16.3582 5.5815 16.638 5.8615C16.918 6.1415 17.0913 6.40817 17.2367 6.7815C17.3462 7.06317 17.4767 7.4865 17.5122 8.2665C17.5505 9.10984 17.5588 9.36317 17.5588 11.4982C17.5588 13.6332 17.5505 13.8865 17.5122 14.7298C17.4765 15.5098 17.3462 15.9332 17.2367 16.2148C17.0917 16.5882 16.918 16.854 16.638 17.1338C16.358 17.4138 16.0922 17.5872 15.7187 17.7322C15.437 17.8422 15.0133 17.9722 14.2333 18.0078C13.39 18.0462 13.1367 18.0545 11.0007 18.0545C8.8645 18.0545 8.61133 18.0462 7.768 18.0078C6.988 17.9718 6.56467 17.8415 6.2825 17.732C5.90917 17.587 5.6425 17.4137 5.3625 17.1337C5.0825 16.8537 4.90917 16.5877 4.76383 16.2142C4.65433 15.9325 4.52383 15.5092 4.48833 14.7292C4.45 13.8858 4.44233 13.6325 4.44233 11.4962C4.44233 9.35984 4.45 9.10784 4.48833 8.2645C4.524 7.4845 4.65433 7.06117 4.76383 6.77917C4.90883 6.40583 5.0825 6.13917 5.3625 5.85917C5.6425 5.57917 5.90917 5.40583 6.2825 5.2605C6.5645 5.1505 6.988 5.0205 7.768 4.98467C8.506 4.95133 8.792 4.94133 10.283 4.93967V4.94167ZM15.271 6.27C14.741 6.27 14.311 6.6995 14.311 7.22967C14.311 7.75967 14.741 8.18967 15.271 8.18967C15.801 8.18967 16.231 7.75967 16.231 7.22967C16.231 6.69967 15.801 6.26967 15.271 6.26967V6.27ZM11.0007 7.39167C8.73183 7.39167 6.89233 9.23117 6.89233 11.5C6.89233 13.7688 8.73183 15.6075 11.0007 15.6075C13.2695 15.6075 15.1083 13.7688 15.1083 11.5C15.1083 9.23117 13.2695 7.39167 11.0007 7.39167ZM11.0007 8.83334C12.4733 8.83334 13.6673 10.0272 13.6673 11.5C13.6673 12.9727 12.4733 14.1667 11.0007 14.1667C9.52783 14.1667 8.334 12.9727 8.334 11.5C8.334 10.0272 9.52783 8.83334 11.0007 8.83334Z"
                fill="white"
              />
            </g>
            <defs>
              <radialGradient
                id="paint0_radial_4455_5496"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(5.92306 24.0005) rotate(-90) scale(21.4715 19.9756)"
              >
                <stop stop-color="#FFDD55" />
                <stop offset="0.1" stop-color="#FFDD55" />
                <stop offset="0.5" stop-color="#FF543E" />
                <stop offset="1" stop-color="#C837AB" />
              </radialGradient>
              <radialGradient
                id="paint1_radial_4455_5496"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(-3.46321 2.22769) rotate(78.6777) scale(9.59793 39.573)"
              >
                <stop stop-color="#3771C8" />
                <stop offset="0.128" stop-color="#3771C8" />
                <stop offset="1" stop-color="#6600FF" stop-opacity="0" />
              </radialGradient>
              <clipPath id="clip0_4455_5496">
                <rect
                  width="22.0007"
                  height="22"
                  fill="white"
                  transform="translate(0 0.5)"
                />
              </clipPath>
            </defs>
          </svg>
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
          <svg
            class="w-6 h-6"
            width="20"
            height="23"
            viewBox="0 0 20 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4455_5500)">
              <path
                d="M16.3197 5.30995C15.1347 4.53732 14.2796 3.30068 14.0129 1.85999C13.9552 1.54881 13.9232 1.22823 13.9232 0.900391H10.1411L10.1347 16.0581C10.0716 17.7558 8.67442 19.1179 6.96182 19.1179C6.42951 19.1179 5.92837 18.9851 5.48698 18.7525C4.47488 18.2202 3.78207 17.1594 3.78207 15.939C3.78207 14.1859 5.20867 12.7593 6.96139 12.7593C7.2888 12.7593 7.60255 12.8135 7.89923 12.9061V9.04506C7.59188 9.0028 7.27984 8.97719 6.96139 8.97719C3.12298 8.97719 0 12.0997 0 15.939C0 18.294 1.17645 20.3784 2.97229 21.6386C4.10265 22.433 5.47845 22.9004 6.96182 22.9004C10.8007 22.9004 13.9232 19.7774 13.9232 15.939V8.25236C15.4066 9.31698 17.2242 9.94447 19.1857 9.94447V6.16198C18.1292 6.16198 17.1452 5.84824 16.3197 5.30995Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_4455_5500">
                <rect
                  width="19.1857"
                  height="22"
                  fill="white"
                  transform="translate(0 0.900391)"
                />
              </clipPath>
            </defs>
          </svg>
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
          <svg
            class="w-6 h-6"
            width="22"
            height="23"
            viewBox="0 0 22 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4455_5502)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M21.7755 6.89428C21.7755 6.89428 21.5607 5.37786 20.8997 4.71198C20.0621 3.83623 19.1242 3.83062 18.6955 3.7798C15.6193 3.55566 10.999 3.55566 10.999 3.55566H10.9909C10.9909 3.55566 6.3727 3.55566 3.29479 3.7798C2.86434 3.83214 1.9278 3.83577 1.09059 4.71198C0.429132 5.37786 0.218922 6.89428 0.218922 6.89428C0.218922 6.89428 0 8.67377 0 10.457V12.1245C0 13.904 0.21879 15.6871 0.21879 15.6871C0.21879 15.6871 0.433554 17.2035 1.09045 17.8705C1.92766 18.7463 3.02795 18.7179 3.51912 18.8113C5.28034 18.9794 11.0005 19.0301 11.0005 19.0301C11.0005 19.0301 15.6248 19.0219 18.7011 18.8019C19.1315 18.7511 20.0677 18.746 20.9053 17.8698C21.5666 17.2039 21.781 15.6858 21.781 15.6858C21.781 15.6858 22.0001 13.9063 22.0001 12.1232V10.4558C21.9956 8.67634 21.7767 6.89322 21.7767 6.89322L21.7755 6.89441L21.7754 6.89428H21.7755ZM8.72019 14.1475V7.96453L14.6632 11.0663L8.72019 14.1475Z"
                fill="#FF0000"
              />
            </g>
            <defs>
              <clipPath id="clip0_4455_5502">
                <rect
                  width="22"
                  height="22"
                  fill="white"
                  transform="translate(0 0.299805)"
                />
              </clipPath>
            </defs>
          </svg>
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

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label"> {i18n('PassportSkinName')} </span>
    <input
      class="hs-form-field__input"
      disabled={profileUpdating || !eoa}
      value={profile?.skins?.at(0)?.name ?? ''}
      on:change|preventDefault={onChangePassportSkinName}
      placeholder={i18n('PassportSkinNamePlaceholder')}
    />
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

  <span class="hs-form-field is-filled mt-[76px]">
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
        {#each passportNonSkinItems as item, i}
          {#if item.payload && profile?.skins
              ?.at(0)
              ?.clips?.find((clip) => clip.payload === item.payload)}
            <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
              <PassportAsset
                props={((clip) => ({
                  item: item,
                  provider: rpcProvider,
                  local: isLocal,
                  isEditable: true,
                  editAction: () => onEditClip(item),
                  description: clip?.description,
                  frameColorHex: clip?.frameColorHex,
                }))(
                  profile?.skins
                    ?.at(0)
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
                  classNames: profile?.skins
                    ?.at(0)
                    ?.clips?.find((clip) => clip.payload === item.payload)
                    ? 'border-2 border-surface-ink'
                    : 'border border-surface-300',
                }}
              />
            </li>
          </button>
        {/each}
      </ul>
    {/if}
  </span>

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

<Modals>
  <div
    slot="backdrop"
    class="fixed inset-0 bg-black/50"
    transition:fade={{ duration: 100 }}
    on:click={onClickBackdrop}
  />
</Modals>
