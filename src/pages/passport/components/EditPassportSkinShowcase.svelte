<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { fade } from 'svelte/transition'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { Clip, Profile, Skin } from '@pages/api/profile'
  import { Modals, closeAllModals, closeModal, openModal } from 'svelte-modals'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import PassportClipEditModal from './PassportClipEditModal.svelte'
  import IconShowcase from './IconShowcase.svelte'
  import IconPlus from './IconPlus.svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let skinIndex = 0
  export let isLocal: boolean
  export let profileFetching = true
  export let profileUpdating = false
  export let isFetchingPurchasedClips = true
  export let profile: Profile = {} as Profile
  export let profileFromAPI: Profile = profile
  export let purchasedClips: PassportItem[] = []
  export let eoa: UndefinedOr<string> = undefined
  export let onClickCreateButton: () => void

  let isDisplayingHint: boolean = false
  let timeoutToHint: UndefinedOr<NodeJS.Timeout> = undefined

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const undoSkinShowcaseUpdate = async () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.map((skin, index) =>
          index === skinIndex
            ? {
                ...skin, // Retain other skin properties ir-respective of whether the skin is modified or not.
                clips:
                  // if all the stored showcase have correct data, reset to the stored data.
                  // if not, reset to `[]`.
                  (profileFromAPI?.skins
                    ?.at(skinIndex)
                    ?.clips?.every((x) => x.sTokenId)
                    ? profileFromAPI?.skins?.at(skinIndex)?.clips
                    : undefined) ?? [],
              }
            : skin,
        ) ?? []), // keep all the other skins before skinIndex.
      ],
    }

    console.log('Profile at resetting pinned non skin item', profile)
  }

  const onClickEditShowcaseClip = (item: PassportItem) => {
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
                    ?.clips?.filter((clip) => clip.sTokenId !== item.assetId) ??
                    ([] as Clip[])),
                  {
                    payload: item.payload!,
                    description,
                    frameColorHex,
                    sTokenId: item.assetId,
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

  const onClickEditModalBackdrop = () => {
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
</script>

<!-- Edit passport skin showcase clips -->
<span class="hs-form-field is-filled mt-[76px]">
  <div class="hs-form-field__label flex items-center justify-between mb-1">
    <span class="hs-form-field__label flex gap-2 items-center">
      {i18n('PassportShowcaseClips')}
      <IconShowcase /> ({profile?.skins?.at(skinIndex)?.clips?.length ?? 0})
    </span>
    <button
      disabled={!eoa ||
        !purchasedClips.length ||
        profileFetching ||
        isFetchingPurchasedClips ||
        profileUpdating}
      on:click|preventDefault={() => undoSkinShowcaseUpdate()}
      class="hs-button is-filled is-large w-fit text-center">Reset</button
    >
  </div>

  {#if !eoa}
    <div class="rounded-md border border-surface-400 p-8 text-accent-200">
      {i18n('ConnectWalletTryAgain')} :)
    </div>
  {:else if isFetchingPurchasedClips || profileFetching}
    <div class="rounded-md border border-surface-400 p-8 text-accent-200 h-48">
      <Skeleton />
    </div>
  {:else if !isFetchingPurchasedClips && !profileFetching && !profile.skins?.at(skinIndex)?.clips?.length}
    <p class="text-center text-xl font-bold mb-6">
      {i18n('PinClipsToShowcaseHelper')}
    </p>
    <ul
      class="grid gap-16 justify-between items-center grid-cols-3 grid-rows-3"
    >
      <button
        class="rounded bg-surface-400 aspect-square flex items-center justify-center"
        on:click={onClickCreateButton}
        ><IconPlus classNames="size-12" />
      </button>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
      <li class="rounded bg-surface-400 aspect-square opacity-50"></li>
    </ul>
  {:else if !isFetchingPurchasedClips && !profileFetching && profile.skins?.at(skinIndex)?.clips?.length && purchasedClips?.length}
    <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      {#each purchasedClips as item, i}
        {#if item.assetId && profile?.skins
            ?.at(skinIndex)
            ?.clips?.find((clip) => clip.sTokenId === item.assetId)}
          <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
            <PassportAsset
              props={((clip) => ({
                item: item,
                provider: rpcProvider,
                local: isLocal,
                isEditable: true,
                editAction: () => onClickEditShowcaseClip(item),
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
      <button
        class="rounded bg-surface-400 aspect-square flex items-center justify-center"
        on:click={onClickCreateButton}
        ><IconPlus classNames="size-12" />
      </button>
    </ul>
  {/if}
</span>

<Modals>
  <div
    slot="backdrop"
    on:click={onClickEditModalBackdrop}
    class="fixed inset-0 bg-black/50"
    transition:fade={{ duration: 100 }}
  />
</Modals>
