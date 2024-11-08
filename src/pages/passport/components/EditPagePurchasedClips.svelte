<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import IconXMark from './IconXMark.svelte'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import IconShowcase from './IconShowcase.svelte'
  import IconSpotlight from './IconSpotlight.svelte'
  import { filter } from 'ramda'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

  export let skinIndex = 0
  export let isLocal: boolean
  export let profileFetching = true
  export let isFetchingPurchasedClips = true
  export let profile: Profile = {} as Profile
  export let purchasedClips: PassportItem[] = []
  export let eoa: UndefinedOr<string> = undefined
  export let target: UndefinedOr<'showcase' | 'spotlight'>
  export let hasSpotlightLimitReadched: boolean = false
  let selectedItem: UndefinedOr<PassportItem>

  $: {
    hasSpotlightLimitReadched =
      (profile?.skins?.at(skinIndex)?.spotlight?.length ?? 0) > 2
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const toggleClipInSpotlight = async (item: PassportItem) => {
    if (!item.payload) {
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
        ...(profile?.skins?.map((skin, index) =>
          index === skinIndex
            ? {
                ...skin,
                spotlight: [
                  ...(skin.spotlight ?? []),
                  {
                    payload: item.payload!,
                    description: '',
                    frameColorHex: '',
                    sTokenId: item.assetId,
                  },
                ],
              }
            : skin,
        ) ?? []), // keep all the other skins before skinIndex.
      ],
    }

    target = undefined
  }

  const toggleClipsInShowcase = async (item: PassportItem) => {
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
        ...(profile?.skins?.map((skin, index) =>
          index === skinIndex
            ? {
                ...skin,
                clips: [
                  ...(skin.clips ?? []),
                  {
                    payload: item.payload!,
                    description: '',
                    frameColorHex: '',
                    sTokenId: item.assetId,
                  },
                ],
              }
            : skin,
        ) ?? []), // keep all the other skins before skinIndex.
      ],
    }

    target = undefined

    console.log(
      'Passort item and profile at pinning passport non skin item',
      item,
      profile,
    )
  }
</script>

<div
  class="fixed z-[999] inset-0 p-2 gap-2 grid grid-rows-[auto_1fr] items-stretch bg-surface-300 overflow-y-scroll opacity-0 animate-[fadeInShrinkToFit_.5s_ease-in-out_forwards]"
>
  <button
    on:click={() => (target = undefined)}
    class="size-12 bg-accent-200 flex justify-center items-center rounded-full text-surface-600 sticky top-0 justify-self-end z-20"
    ><IconXMark classNames="size-6" />
  </button>
  <!-- Passport items other than type: css | stylesheet-link -->
  <span class="mx-auto container">
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
    {:else if !isFetchingPurchasedClips && !profileFetching && !purchasedClips?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PurchasePassportClips')}
      </div>
    {:else if purchasedClips?.length}
      <ul class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {#each purchasedClips as item, i}
          <li id={`assets-${i.toString()}`} class="relative empty:hidden">
            <button
              on:click={() => (selectedItem = item)}
              class="w-full h-full disabled:opacity-30"
              disabled={profile?.skins?.[skinIndex]?.[
                target === 'showcase' ? 'clips' : 'spotlight'
              ]?.some((x) => x.sTokenId === item.assetId)}
            >
              <PassportAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: isLocal,
                  linkToClub: false,
                  classNames:
                    selectedItem?.assetId === item.assetId
                      ? 'h-full outline outline-2 outline-accent-200 !border-transparent'
                      : 'h-full',
                }}
              />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </span>
  {#if selectedItem !== undefined}
    <button
      on:click={() =>
        target === 'showcase'
          ? selectedItem && toggleClipsInShowcase(selectedItem)
          : selectedItem && toggleClipInSpotlight(selectedItem)}
      class="bg-primary-ink px-8 py-6 text-2xl font-bold flex justify-center items-center rounded-full text-accent-ink sticky bottom-6 shadow justify-self-center"
      >Done
    </button>
  {/if}
</div>
