<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'

  import { Strings } from '../i18n'
  import UserAsset from './UserAsset.svelte'
  import type { Profile, Skin } from '@pages/api/profile'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { AssetDocument } from '@fixtures/api/assets/schema'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  import X from '@assets/X.svg'
  import Twitch from '@assets/twitch.svg'
  import Tiktok from '@assets/tiktok.svg'
  import Youtube from '@assets/youtube.svg'
  import Instagram from '@assets/instagram.svg'
  import { find } from 'ramda'

  export let id: string

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  let connection: UndefinedOr<typeof Connection> = undefined
  let profile: Profile = {} as Profile
  let eoa: UndefinedOr<string> = undefined
  let avatarUploading = false
  let profileUpdating = false
  let updatingStatus: UndefinedOr<'success' | 'error'> = undefined
  let assetsNft: AssetDocument[] = []
  let assetsSbt: AssetDocument[] = []

  let PINNED_ITEMS: string[] = profile.pinnedItems ?? []
  let SKIN_PASSPORT_ITMES: AssetDocument[] = []

  let assetsPassportItems: (AssetDocument & { isInProfileSkin: boolean })[] = []

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

  const fetchPassportItemSelectionStatus = (item: AssetDocument) => {
    const skin = profile?.skins?.at(0)
    if (!skin) {
      return {
        ...item,
        isInProfileSkin: false,
      }
    }

    const isSkinInProfile = Object.keys(skin)
      .map((k: string) => {
        const skinProperty = skin[k as keyof Skin]
        if (!skinProperty) {
          return false
        }

        if (
          typeof skinProperty === typeof '' &&
          skinProperty === item.payload
        ) {
          return true
        }

        if (Array.isArray(skinProperty)) {
          return skinProperty.some((property) => property === item.payload)
        }

        return false
      })
      .some((k) => k)

    return {
      ...item,
      isInProfileSkin: isSkinInProfile,
    }
  }

  const fetchData = async () => {
    const req = await fetch(`/api/profile/${id}`)
    const data: Profile = await req.json()
    profile = {
      ...data,
    } as Profile
    PINNED_ITEMS = profile.pinnedItems ?? []

    const [nfts, sbts, passportItem] = await Promise.all([
      fetch(`/api/assets/related/account/${eoa}/?type=nft&size=999`)
        .then((res) => res.json())
        .catch(() => []),
      fetch(`/api/assets/related/account/${eoa}/?type=sbt&size=999`)
        .then((res) => res.json())
        .catch(() => []),
      fetch(`/api/assets/related/account/${eoa}/?type=passportItem&size=999`)
        .then((res) => res.json())
        .catch(() => []),
    ])

    assetsNft = nfts.data
    assetsSbt = sbts.data
    SKIN_PASSPORT_ITMES = passportItem.data
    assetsPassportItems = (passportItem.data as AssetDocument[]).map((item) =>
      fetchPassportItemSelectionStatus(item),
    )
  }

  const resetPinnedItem = () => {
    profile = {
      ...profile,
      pinnedItems: PINNED_ITEMS,
    }
  }

  const pinMembership = (item: AssetDocument) => {
    profile = {
      ...profile,
      pinnedItems: profile.pinnedItems?.includes(
        `${item.id}-${item.payload}-${item.contract}-${item.type}`,
      )
        ? profile.pinnedItems?.filter(
            (pinnedItem) =>
              pinnedItem !==
              `${item.id}-${item.payload}-${item.contract}-${item.type}`,
          )
        : [
            ...(profile.pinnedItems ?? []),
            `${item.id}-${item.payload}-${item.contract}-${item.type}`,
          ],
    }
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)

    const { connection: _conn } = await import(
      '@devprotocol/clubs-core/connection'
    )
    connection = _conn
    connection().account.subscribe((acc) => {
      if (eoa !== acc) {
        // Wallet is connected or addrress has changed so update the data again.
        fetchData()
      }
      eoa = acc
    })

    fetchData()
  })

  const togglePassportItemToProfile = (payload: string | undefined) => {
    console.log('Hit')
    if (!payload) {
      return
    }

    const passportItem =
      assetsPassportItems.find((item) => item.payload === payload) ?? undefined
    if (!passportItem) {
      return
    }

    assetsPassportItems = [
      ...assetsPassportItems.filter(
        (item) => passportItem?.payload !== payload,
      ),
      {
        ...passportItem,
        isInProfileSkin: !passportItem?.isInProfileSkin,
      },
    ]
  }

  const resetProfileSelectedPassportItem = () => {
    assetsPassportItems = SKIN_PASSPORT_ITMES.map((item) =>
      fetchPassportItemSelectionStatus(item),
    )
  }

  const addProfile = async () => {}
</script>

<div class="w-full">
  <div
    class="w-fit max-w-full flex gap-[15px] py-[8px] px-[16px] items-center justify-start"
  >
    <p class="font-body font-bold text-base text-[#000000] text-center">
      Default profile
    </p>
    <button
      on:click|preventDefault={addProfile}
      disabled={true}
      class="hs-button is-filled is-large w-fit text-center line-through text-white"
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
        disabled={profileUpdating}
        on:change={onFileSelected}
      />
    </label>
  </div>

  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label"> {i18n('Username')} </span>
    <input
      class="hs-form-field__input"
      disabled={profileUpdating}
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
          disabled={profileUpdating}
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
          disabled={profileUpdating}
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
          disabled={profileUpdating}
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
          disabled={profileUpdating}
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
          disabled={profileUpdating}
          bind:value={profile.youtubeProfile}
        />
      </div>
    </div>
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label"> {i18n('PassportSkin')} </span>
      <button
        on:click|preventDefault={resetProfileSelectedPassportItem}
        class="hs-button is-filled is-large w-fit text-center hs-form-field__label !text-white"
        >Reset</button
      >
    </div>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      {#if assetsPassportItems?.length}
        {#each assetsPassportItems as item, i}
          <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
            <button
              on:click|preventDefault={() =>
                togglePassportItemToProfile(item.payload)}
            >
              <UserAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: true,
                  isSelected: item.isInProfileSkin,
                }}
              />
            </button>
          </li>
        {/each}
      {:else if !assetsPassportItems?.length}
        <div class="rounded-md border border-surface-400 p-8 text-accent-200">
          {i18n('Empty')} :)
        </div>
      {:else if !assetsPassportItems}
        {#each new Array(6) as item, i}
          <li id={i.toString()}>
            <span class="block h-96"><Skeleton /></span>
          </li>
        {/each}
      {/if}
    </ul>
  </label>

  <label class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label"> {i18n('PinnedItems')} </span>
      <button
        on:click|preventDefault={resetPinnedItem}
        class="hs-button is-filled is-large w-fit text-center hs-form-field__label !text-white"
        >Reset</button
      >
    </div>

    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      {#if profile.pinnedItems?.length}
        {#each profile.pinnedItems as item, i}
          {#if [...assetsNft, ...assetsSbt].find((i) => `${i.id}-${i.payload}-${i.contract}-${i.type}` === item) !== undefined}
            <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
              <UserAsset
                props={{
                  item: [...assetsNft, ...assetsSbt].find(
                    (i) =>
                      `${i.id}-${i.payload}-${i.contract}-${i.type}` === item,
                  ),
                  provider: rpcProvider,
                  local: true,
                }}
              />
            </li>
          {/if}
        {/each}
      {:else if !profile.pinnedItems?.length}
        <div class="rounded-md border border-surface-400 p-8 text-accent-200">
          {i18n('Empty')} :)
        </div>
      {:else if !profile.pinnedItems}
        {#each new Array(6) as item, i}
          <li id={i.toString()}>
            <span class="block h-96"><Skeleton /></span>
          </li>
        {/each}
      {/if}
    </ul>
  </label>

  <!-- Memberships -->
  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">
      {i18n('Memeberships')}
    </span>
    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      {#if [...assetsNft]?.length}
        {#each [...assetsNft] as item, i}
          <button on:click={() => pinMembership(item)}>
            <li id={`assets-${i.toString()}`} class="empty:hidden">
              <UserAsset props={{ item, provider: rpcProvider, local: true }} />
            </li>
          </button>
        {/each}
      {:else if ![...assetsNft]?.length}
        <div class="rounded-md border border-surface-400 p-8 text-accent-200">
          {i18n('Empty')} :)
        </div>
      {:else if !assetsNft}
        {#each new Array(6) as item, i}
          <li id={i.toString()}>
            <span class="block h-96"><Skeleton /></span>
          </li>
        {/each}
      {/if}
    </ul>
  </label>

  <!-- Achievements -->
  <label class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">
      {i18n('Achievements')}
    </span>
    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      {#if [...assetsSbt]?.length}
        {#each [...assetsSbt] as item, i}
          <li id={`assets-${i.toString()}`} class="empty:hidden">
            <UserAsset props={{ item, provider: rpcProvider, local: true }} />
          </li>
        {/each}
      {:else if ![...assetsSbt]?.length}
        <div class="rounded-md border border-surface-400 p-8 text-accent-200">
          {i18n('Empty')} :)
        </div>
      {:else if !assetsSbt}
        {#each new Array(6) as item, i}
          <li id={i.toString()}>
            <span class="block h-96"><Skeleton /></span>
          </li>
        {/each}
      {/if}
    </ul>
  </label>

  {#if eoa === id}
    <button
      on:click={onSubmit}
      disabled={profileUpdating}
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
