<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { Clip, Profile } from '@pages/api/profile'
  import { closeAllModals, openModal } from 'svelte-modals'
  import { nanoid } from 'nanoid'
  import Tags from './Tags.svelte'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import PassportClipEditModal from './PassportClipEditModal.svelte'
  import IconShowcase from './IconShowcase.svelte'
  import IconPlus from './IconPlus.svelte'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  dayjs.extend(utc)

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])
  let thisEl: HTMLSpanElement
  let tags: string[] = []

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
  export const getElement = () => thisEl

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

  const onClickEditShowcaseClip = (item?: PassportItem) => {
    if (
      !item ||
      !profile?.skins
        ?.at(skinIndex)
        ?.clips?.find((clip) => clip.payload === item.payload)
    ) {
      console.error(
        'Clip not found in profile showcase when trying to edit it.',
        item,
      )
      return
    }

    document.body.classList.add('overflow-hidden')
    openModal(PassportClipEditModal, {
      item,
      tags: profile?.skins
        ?.at(skinIndex)
        ?.clips?.find((clip) => clip.id === item.id)?.tags,
      hex: profile?.skins
        ?.at(skinIndex)
        ?.clips?.find((clip) => clip.id === item.id)?.frameColorHex,
      description:
        profile?.skins
          ?.at(skinIndex)
          ?.clips?.find((clip) => clip.id === item.id)?.description ?? '',
      onClose: async () => {
        document.body.classList.remove('overflow-hidden')
        closeAllModals()
      },
      closeAllOnFinished: true,
      action: async (
        clip: PassportItem,
        description: string,
        tags: string[],
        frameColorHex: string | undefined,
        method,
      ): Promise<boolean> => {
        console.log(clip, description, frameColorHex, method)
        if (
          !profile?.skins
            ?.at(skinIndex)
            ?.clips?.find((clip) => clip.id === item.id)
        ) {
          console.error(
            'Clip not found in profile showcase when trying to edit it.',
            item,
          )
          return false
        }

        if (clip.payload !== item.payload && clip.id !== item.id) {
          console.error('Clip mismatch when trying to edit it.', item, clip.id)
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
                      clips:
                        method === 'patch'
                          ? [
                              ...(skin.clips?.map((clip) =>
                                clip.id === item.id
                                  ? {
                                      ...clip,
                                      id: clip.id ?? nanoid(),
                                      description,
                                      tags,
                                      frameColorHex,
                                      createdAt: clip.createdAt
                                        ? clip.createdAt
                                        : dayjs().utc().toDate().getTime(),
                                      updatedAt: dayjs()
                                        .utc()
                                        .toDate()
                                        .getTime(),
                                    }
                                  : clip,
                              ) ?? ([] as Clip[])),
                            ]
                          : skin.clips?.filter((x) => x.id !== item.id),
                    }
                  : skin,
              ) ?? []), // keep all the other skins before skinIndex.
            ],
          }
          console.log('profile', profile)
          return true
        } catch (e) {
          return false
        }
      },
    })
  }

  const clips = (prof: Profile) => prof.skins?.at(skinIndex)?.clips
  const purchasedClipsBySkinClip = (clip: Clip, items: PassportItem[]) => {
    const data =
      (clip.link ? clip : undefined) ??
      items.find((x) => x.assetId === clip.sTokenId)
    return {
      ...data,
      id: clip?.id, // the id should always point to clip id and not assetDocId or passportDocId or anyother id.
      tags: clip?.tags,
    }
  }
</script>

<!-- Edit passport skin showcase clips -->
<span class="hs-form-field is-filled mt-16" bind:this={thisEl}>
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
      class="grid gap-2 lg:gap-4 justify-between items-center grid-cols-3 grid-rows-3"
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
  {:else if !isFetchingPurchasedClips && !profileFetching && profile.skins?.at(skinIndex)?.clips?.length}
    <ul class="grid gap-2 lg:gap-4 grid-cols-3">
      {#each clips(profile) ?? [] as clip, i}
        <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
          <PassportAsset
            props={((item) => ({
              item,
              provider: rpcProvider,
              local: isLocal,
              isEditable: true,
              editAction: () => onClickEditShowcaseClip(item),
              description: clip.description,
              frameColorHex: clip.frameColorHex,
            }))(purchasedClipsBySkinClip(clip, purchasedClips))}
          />
        </li>
      {/each}
      <button
        class="rounded bg-surface-400 aspect-square flex items-center justify-center"
        on:click={onClickCreateButton}
        ><IconPlus classNames="size-12" />
      </button>
    </ul>
  {/if}
</span>
