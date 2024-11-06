<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { fade } from 'svelte/transition'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { Clip, Profile, Skin } from '@pages/api/profile'
  import { Modals, closeAllModals, closeModal, openModal } from 'svelte-modals'
  import IconSpotlight from './IconSpotlight.svelte'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import PassportClipEditModal from './PassportClipEditModal.svelte'
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
  export let hasSpotlightLimitReadched: boolean = false
  export let onClickCreateButton: () => void

  let isDisplayingHint: boolean = false
  let timeoutToHint: UndefinedOr<NodeJS.Timeout> = undefined

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const undoSkinSpotlightUpdate = async () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.map((skin, index) =>
          index === skinIndex
            ? {
                ...skin,
                spotlight:
                  // if all the stored spotlight have correct data, reset to the stored data.
                  // if not, reset to `[]`.
                  (profileFromAPI?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.every((x) => x.sTokenId)
                    ? profileFromAPI?.skins?.at(skinIndex)?.spotlight
                    : undefined) ?? [],
              }
            : skin,
        ) ?? []), // keep all the other skins before skinIndex.
      ],
    }
  }

  const onClickEditSpotlightClip = (item: PassportItem) => {
    if (
      !profile?.skins
        ?.at(skinIndex)
        ?.spotlight?.find((clip) => clip.payload === item.payload)
    ) {
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
          return false
        }

        if (clip.payload !== item.payload) {
          return false
        }

        try {
          profile = {
            ...profile, // Retain other modified fields.
            skins: [
              ...(profile?.skins?.map((skin, index) =>
                index === skinIndex
                  ? {
                      ...skin, // Retain other skin properties irrespective of whether the skin is modified or not.
                      spotlight: [
                        ...(skin.spotlight?.map((clip) =>
                          clip.sTokenId === item.assetId
                            ? {
                                payload: item.payload!,
                                sTokenId: item.assetId,
                                description,
                                frameColorHex,
                              }
                            : clip,
                        ) ?? ([] as Clip[])),
                      ],
                    }
                  : skin,
              ) ?? []), // keep all the other skins before skinIndex.
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

<!-- Edit passport skin spotlight clips -->
<div class="w-full">
  <span class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label flex items-center gap-2">
        {i18n('PassportSpotlightClips')}
        <IconSpotlight />
        ({profile?.skins?.at(skinIndex)?.spotlight?.length ?? 0})
      </span>

      <button
        disabled={!eoa ||
          !purchasedClips.length ||
          profileFetching ||
          isFetchingPurchasedClips ||
          profileUpdating}
        on:click|preventDefault={() => undoSkinSpotlightUpdate()}
        class="hs-button is-filled is-large w-fit text-center">Reset</button
      >
    </div>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if isFetchingPurchasedClips || profileFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !isFetchingPurchasedClips && !profileFetching && !profile.skins?.at(skinIndex)?.spotlight?.length}
      <p class="text-center text-xl font-bold mb-6">
        {i18n('PinClipsToSpotlightHelper')}
      </p>
      <ul class="flex gap-16 justify-between items-center">
        <li
          class="rounded bg-surface-400 w-[25%] aspect-[11/16] opacity-50"
        ></li>
        <button
          class="rounded bg-surface-400 grow aspect-[11/16] flex items-center justify-center"
          on:click={onClickCreateButton}
          ><IconPlus classNames="size-12" />
        </button>
        <li
          class="rounded bg-surface-400 w-[25%] aspect-[11/16] opacity-50"
        ></li>
      </ul>
    {:else if !isFetchingPurchasedClips && !profileFetching && profile.skins?.at(skinIndex)?.spotlight?.length && purchasedClips?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each purchasedClips as item, i}
          {#if item.assetId && profile?.skins
              ?.at(skinIndex)
              ?.spotlight?.find((clip) => clip.sTokenId === item.assetId)}
            <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
              <PassportAsset
                props={((clip) => ({
                  item: item,
                  provider: rpcProvider,
                  local: isLocal,
                  isEditable: true,
                  editAction: () => onClickEditSpotlightClip(item),
                  description: clip?.description,
                  frameColorHex: clip?.frameColorHex,
                }))(
                  profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.find((clip) => clip.payload === item.payload),
                )}
              />
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </span>
</div>

<Modals>
  <div
    slot="backdrop"
    on:click={onClickEditModalBackdrop}
    class="fixed inset-0 bg-black/50"
    transition:fade={{ duration: 100 }}
  />
</Modals>
