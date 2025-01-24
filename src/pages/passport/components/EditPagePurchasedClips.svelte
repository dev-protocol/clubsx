<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import IconXMark from './IconXMark.svelte'
  import debounce from 'lodash/debounce'
  import { mediaSource } from '@devprotocol/clubs-plugin-passports/media'
  import { MediaEmbed } from '@devprotocol/clubs-plugin-passports/svelte'

  import TikTok from '@assets/sns/TikTok.svg'
  import Instagram from '@assets/sns/Instagram.svg'
  import X from '@assets/sns/X.svg'
  import YouTube from '@assets/sns/YouTube.svg'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'
  import IconShowcase from './IconShowcase.svelte'
  import IconSpotlight from './IconSpotlight.svelte'
  import { filter } from 'ramda'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import { nanoid } from 'nanoid'
  dayjs.extend(utc)

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
  let linkingMode: UndefinedOr<boolean>
  let link: UndefinedOr<string>
  let description: UndefinedOr<string>
  let linkError: UndefinedOr<string>

  $: {
    hasSpotlightLimitReadched =
      (profile?.skins?.at(skinIndex)?.spotlight?.length ?? 0) > 2
  }

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const toggleClipInSpotlight = async (item?: PassportItem) => {
    if (!item?.payload && !link) {
      return
    }

    const isClipInSpotlight = !!profile?.skins
      ?.at(skinIndex)
      ?.spotlight?.find((clip) => clip.payload === item?.payload)

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
        ...(profile?.skins?.length
          ? profile.skins.map((skin, index) =>
              index === skinIndex
                ? {
                    ...skin,
                    spotlight: [
                      ...(skin.spotlight ?? []),
                      {
                        ...(item
                          ? {
                              payload: item.payload!,
                              description: '',
                              frameColorHex: '',
                              sTokenId: item.assetId,
                            }
                          : {
                              link: link,
                            }),
                        id: nanoid(),
                        createdAt: dayjs().utc().toDate().getTime(),
                        updatedAt: 0,
                      },
                    ],
                  }
                : skin,
            )
          : [
              {
                ...({} as Skin),
                spotlight: [
                  {
                    ...(item
                      ? {
                          payload: item.payload!,
                          description: '',
                          frameColorHex: '',
                          sTokenId: item.assetId,
                        }
                      : { link }),
                    id: nanoid(),
                    createdAt: dayjs().utc().toDate().getTime(),
                    updatedAt: 0,
                  },
                ],
              },
            ]), // keep all the other skins before skinIndex.
      ],
    }

    target = undefined
  }

  const toggleClipsInShowcase = async (item?: PassportItem) => {
    if (!item?.payload && !link) {
      console.log(
        `Passport non skin item not pinned as clips since item.paylaod missing`,
        item?.id,
      )
      return
    }

    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.length
          ? profile?.skins?.map((skin, index) =>
              index === skinIndex
                ? {
                    ...skin,
                    clips: [
                      ...(skin.clips ?? []),
                      {
                        ...(item
                          ? {
                              payload: item.payload!,
                              description: '',
                              frameColorHex: '',
                              sTokenId: item.assetId,
                            }
                          : { link }),
                        id: nanoid(),
                        createdAt: dayjs().utc().toDate().getTime(),
                        updatedAt: 0,
                      },
                    ],
                  }
                : skin,
            )
          : [
              {
                ...({} as Skin),
                clips: [
                  {
                    ...(item
                      ? {
                          payload: item.payload!,
                          description: '',
                          frameColorHex: '',
                          sTokenId: item.assetId,
                        }
                      : { link }),
                    id: nanoid(),
                    createdAt: dayjs().utc().toDate().getTime(),
                    updatedAt: 0,
                  },
                ],
              },
            ]), // keep all the other skins before skinIndex.
      ],
    }

    target = undefined

    console.log(
      'Passort item and profile at pinning passport non skin item',
      item,
      profile,
    )
  }

  const handleInput = () => {
    const isLinkValid = typeof mediaSource(link) === 'string'
    linkError = isLinkValid ? undefined : 'ERROR'
    console.log({ linkError, link })
  }
</script>

<div
  class={`fixed z-[999] inset-0 p-2 gap-2 grid grid-rows-[auto_1fr] items-stretch bg-surface-300 overflow-y-scroll opacity-0 ${
    linkingMode === undefined
      ? 'animate-[fadeInShrinkToFit_.5s_ease-in-out_forwards]'
      : linkingMode === true
        ? 'animate-[fadeOutFitToGrow_.5s_ease-in-out_forwards]'
        : 'animate-[fadeInGrowToShrink_.5s_ease-in-out_forwards]'
  }`}
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
    {:else if !isFetchingPurchasedClips && !profileFetching}
      <ul class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        <li id="assets-link" class="relative">
          <button
            on:click={() => (linkingMode = true)}
            class="w-full h-full shadow-md rounded-md p-2 grid gap-4 border border-black/20 h-full bg-surface-200 text-black content-evenly"
          >
            <span class="font-bold">{i18n('AddFromExternal')}</span>
            <div
              class="grid gap-4 grid-cols-[repeat(2,minmax(0,45px))] justify-center justify-items-center items-center"
            >
              <img src={TikTok.src} alt="TikTok" />
              <img src={YouTube.src} alt="YouTube" /><img
                src={Instagram.src}
                alt="Instagram"
              /><img src={X.src} class="size-[80%]" alt="X" />
            </div>
          </button>
        </li>
        {#if !purchasedClips?.length}
          <li>
            <span
              class="w-full h-full rounded-md p-2 grid gap-4 border border-black/5 h-full text-black/50 items-center"
            >
              <span class="font-bold">{i18n('NoPurchasedItem')}</span>
            </span>
          </li>
        {/if}
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

{#if linkingMode}
  <div
    class="fixed z-[999] inset-0 p-2 flex justify-center items-center bg-surface-300 overflow-y-scroll opacity-0 animate-[fadeInShrinkToFit_.5s_ease-in-out_forwards]"
  >
    <div
      class="flex m-auto flex-col w-full max-w-2xl items-center justify-center p-12 text-surface-ink subpixel-antialiased lg:pb-32 gap-6"
    >
      <div class="w-full flex items-center justify-between">
        <button
          on:click|preventDefault={() => (linkingMode = false)}
          class="w-6 h-6"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6L18 18"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <p class="font-DMSan font-bold text-base">{i18n('AddFromExternal')}</p>

        <button
          disabled={Boolean(link && linkError !== undefined)}
          on:click={() =>
            target === 'showcase'
              ? toggleClipsInShowcase()
              : toggleClipInSpotlight()}
          class="hs-button is-filled is-large w-fit text-center">Done</button
        >
      </div>

      <label class="hs-form-field is-filled">
        <span class="hs-form-field__label"> {i18n('ContentLink')} </span>
        <input
          class="hs-form-field__input"
          bind:value={link}
          on:keyup={debounce(handleInput, 700)}
          placeholder={i18n('ContentLinkPlaceholder')}
        />
      </label>

      {#if link && linkError === undefined}
        <div class="flex justify-center">
          <div class="overflow-hidden rounded">
            <MediaEmbed src={link} />
          </div>
        </div>
      {/if}

      <label class="hs-form-field is-filled">
        <span class="hs-form-field__label"> {i18n('Description')} </span>
        <textarea
          class="hs-form-field__input"
          bind:value={description}
          placeholder={i18n('ContentLinkDescriptionPlaceholder')}
        />
      </label>
    </div>
  </div>
{/if}
