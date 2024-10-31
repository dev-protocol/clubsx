<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { Clip, Profile, Skin } from '@pages/api/profile'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

  export let skinIndex = 0
  export let isLocal: boolean
  export let profileFetching = true
  export let profileUpdating = false
  export let passportItemsFetching = true
  export let profile: Profile = {} as Profile
  export let eoa: UndefinedOr<string> = undefined
  export let passportNonSkinItems: PassportItem[] = []

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
</script>

<div class="w-full">
  <!-- Passport items other than type: css | stylesheet-link -->
  <span class="hs-form-field is-filled mt-[76px]">
    <span class="hs-form-field__label">
      {i18n('PassportClips')} ({passportNonSkinItems?.length ?? 0})
    </span>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if passportItemsFetching || profileFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !passportItemsFetching && !profileFetching && !passportNonSkinItems?.length}
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
                  passportItemsFetching ||
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
                on:click|preventDefault={() => toggleClipsInShowcase(item)}
                disabled={!eoa ||
                  !passportNonSkinItems.length ||
                  profileFetching ||
                  passportItemsFetching ||
                  profileUpdating}
              >
                <!-- Showcase SVG -->
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
</div>
