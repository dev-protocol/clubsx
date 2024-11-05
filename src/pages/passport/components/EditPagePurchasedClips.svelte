<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import '@plugins/admin/assets/animation.css'

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
  export let profileUpdating = false
  export let isFetchingPurchasedClips = true
  export let profile: Profile = {} as Profile
  export let purchasedClips: PassportItem[] = []
  export let eoa: UndefinedOr<string> = undefined
  export let hasSpotlightLimitReadched: boolean = false

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
                spotlight: skin.spotlight?.some(
                  (clip) => clip.sTokenId === item.assetId,
                )
                  ? [
                      ...(skin.spotlight?.filter(
                        (clip) =>
                          clip.sTokenId && clip.sTokenId !== item.assetId,
                      ) ?? []),
                    ]
                  : [
                      ...(skin.spotlight?.filter((x) => x.sTokenId) ?? []),
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
                clips: skin.clips?.some(
                  (clip) => clip.sTokenId === item.assetId,
                )
                  ? [
                      ...(skin.clips?.filter(
                        (clip) =>
                          clip.sTokenId && clip.sTokenId !== item.assetId,
                      ) ?? []),
                    ]
                  : [
                      ...(skin.clips?.filter((x) => x.sTokenId) ?? []),
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

    console.log(
      'Passort item and profile at pinning passport non skin item',
      item,
      profile,
    )
  }
</script>

<div class="">
  <!-- Passport items other than type: css | stylesheet-link -->
  <span class="hs-form-field is-filled">
    <span class="hs-form-field__label">
      {i18n('PassportClips')} ({purchasedClips?.length ?? 0})
    </span>

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
      <ul class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        {#each purchasedClips as item, i}
          <li id={`assets-${i.toString()}`} class="relative empty:hidden">
            <div class="p-1 flex flex-col gap-2 bg-surface-300 rounded-md">
              <!-- Add to spotlight -->
              <div
                class="flex place-self-start rounded border border-primary-200 overflow-hidden"
              >
                <button
                  data-is-added={profile?.skins
                    ?.at(skinIndex)
                    ?.spotlight?.some((clip) => clip.sTokenId === item.assetId)}
                  class="p-2 box-content w-9 cursor-pointer block border-r border-primary-200 transition text-accent-600 hover:text-accent-200 data-[is-added=true]:bg-accent-200 data-[is-added=true]:text-primary-600 disabled:cursor-not-allowed disabled:hover:animate-[horizontal-shaking_.06s_5]"
                  on:click|preventDefault={() => toggleClipInSpotlight(item)}
                  disabled={!eoa ||
                    !purchasedClips.length ||
                    profileFetching ||
                    isFetchingPurchasedClips ||
                    profileUpdating ||
                    (profile?.skins
                      ?.at(skinIndex)
                      ?.spotlight?.every(
                        (clip) => clip.sTokenId !== item.assetId,
                      ) &&
                      hasSpotlightLimitReadched)}
                >
                  <!-- Spotlight -->
                  <IconSpotlight classNames="w-full aspect-square" />
                  <span class="text-[.5rem]">Spotlight</span>
                </button>

                <!-- Add to showcase/pinned clips -->
                <button
                  data-is-added={profile?.skins
                    ?.at(skinIndex)
                    ?.clips?.some((clip) => clip.sTokenId === item.assetId)}
                  class="p-2 box-content w-9 cursor-pointer block transition text-accent-600 hover:text-accent-200 data-[is-added=true]:bg-accent-200 data-[is-added=true]:bg-accent-200 data-[is-added=true]:text-primary-600"
                  on:click|preventDefault={() => toggleClipsInShowcase(item)}
                  disabled={!eoa ||
                    !purchasedClips.length ||
                    profileFetching ||
                    isFetchingPurchasedClips ||
                    profileUpdating}
                >
                  <!-- Showcase SVG -->
                  <IconShowcase classNames="w-full aspect-square" />
                  <span class="text-[.5rem]">Showcase</span>
                </button>
              </div>
              <PassportAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: isLocal,
                  classNames: 'xxxs',
                }}
              />
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </span>
</div>
