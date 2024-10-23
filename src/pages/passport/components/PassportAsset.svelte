<script lang="ts">
  import { always } from 'ramda'
  import { onMount } from 'svelte'
  import { decodeTokenURI } from '@fixtures/nft'
  import { decode, markdownToHtml } from '@devprotocol/clubs-core'
  import type { ClubsData } from '@pages/api/clubs'
  import { whenDefined } from '@devprotocol/util-ts'
  import { Contract, type ContractRunner } from 'ethers'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import hexRgb from 'hex-rgb'
  import { loadImage, ABI_NFT } from '../utils'
  import type { PassportItem, ImageData } from '../types'
  import { isDark } from '@fixtures/color'

  export let props: {
    local: boolean
    item: PassportItem
    classNames?: string
    isEditable?: boolean
    provider: ContractRunner
    description?: UndefinedOr<string>
    frameColorHex?: UndefinedOr<string>
    editAction?: (item: PassportItem) => void
  }

  let assetName: string
  let notFound: boolean = false
  let club: ClubsData | undefined
  let assetImage: ImageData | undefined
  let htmlDescription: UndefinedOr<string>
  let isFrameDark: UndefinedOr<boolean>

  $: {
    htmlDescription = whenDefined(props.description, markdownToHtml)
    isFrameDark = whenDefined(
      props.frameColorHex?.startsWith('#') ? props.frameColorHex : undefined,
      isDark,
    )
  }

  let clubUrl = whenDefined(
    club,
    ({ config }: { config: ClubsData['config'] }) => decode(config.source).url,
  )
  let clubName = whenDefined(
    club,
    ({ config }: { config: ClubsData['config'] }) => decode(config.source).name,
  )

  let contract = new Contract(
    props.item?.contract ?? '',
    ABI_NFT,
    props.provider,
  )

  let clubApiAlt = props.local
    ? `https://prerelease.clubs.place/api/clubs?p=${props.item?.propertyAddress}`
    : `https://clubs.place/api/clubs?p=${props.item?.propertyAddress}`

  onMount(async () => {
    const [clubApiPri, uri] = await Promise.all([
      fetch(`/api/clubs?p=${props.item?.propertyAddress}`)
        .then((res) => res.json())
        .then((res) => res[0] as null | ClubsData)
        .catch(always(null)),

      whenDefined(props.item?.assetId, async (id: string | number) =>
        decodeTokenURI(
          await contract.tokenURI(id),
          (cid) => `https://${cid}.ipfs.nftstorage.link`,
        ),
      ),
    ])

    const clubApi = clubApiPri
      ? clubApiPri
      : await fetch(clubApiAlt)
          .then((res) => res.json())
          .then((res) => res[0] as null | ClubsData)
          .catch(always(null))

    club = clubApi ? clubApi : undefined

    clubUrl = whenDefined(
      club,
      ({ config }: { config: ClubsData['config'] }) =>
        decode(config.source).url,
    )
    clubName = whenDefined(
      club,
      ({ config }: { config: ClubsData['config'] }) =>
        decode(config.source).name,
    )

    notFound = !clubApi
    assetName = uri?.name ?? ''
    assetImage = notFound
      ? undefined
      : await whenDefined(uri?.htmlImageSrc, loadImage)
  })

  const onEditClip = (item: PassportItem) => {
    props.editAction && props.editAction(item)
  }
</script>

{#if !notFound || !props.item}
  <div
    class={`shadow-md rounded-md p-4 grid gap-4 ${props.classNames ?? ''} ${props.frameColorHex ? 'bg-[var(--frameColor)]' : 'bg-surface-200'} ${isFrameDark ? 'text-white' : 'text-black'}`}
    style={props.frameColorHex
      ? `--frameColor: ${props.frameColorHex}`
      : undefined}
  >
    {#if assetImage}
      <img
        src={assetImage.src}
        class="rounded-md w-full max-w-full"
        alt="Asset"
      />
    {:else}
      <Skeleton />
    {/if}

    <div class="flex gap-1.5 items-start justify-between">
      <div class="justify-self-start text-left">
        {#if htmlDescription}
          {@html htmlDescription}
        {:else}
          <p>{assetName ?? ''}</p>
        {/if}
        {#if !clubUrl || !clubName}
          <span class="w-full h-3"><Skeleton /></span>
        {:else}
          <a href="clubUrl"><span class="opacity-50">{clubName ?? ''}</span></a>
        {/if}
      </div>

      {#if props.isEditable}
        <button
          class="relative w-6 h-6 justify-self-end cursor-pointer"
          on:click|preventDefault={() => onEditClip(props.item)}
        >
          <svg
            class="h-6 w-6"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.4143 5.54907C19.0393 5.1975 18.5306 5 18.0002 5C17.4699 5 16.9612 5.1975 16.5861 5.54907L15.7046 6.3755L18.5328 9.02693L19.4143 8.2005C19.7893 7.84888 20 7.37201 20 6.87478C20 6.37756 19.7893 5.90069 19.4143 5.54907ZM17.7244 9.78479L14.8962 7.13336L5.63906 15.8119C5.16885 16.2525 4.82319 16.7961 4.63334 17.3934L4.02381 19.3112C3.99439 19.4038 3.99219 19.5021 4.01746 19.5957C4.04273 19.6893 4.09453 19.7748 4.16737 19.8431C4.24021 19.9114 4.33139 19.9599 4.43125 19.9836C4.53111 20.0073 4.63595 20.0053 4.73467 19.9777L6.78039 19.4062C7.41752 19.2283 7.99728 18.9042 8.46725 18.4634L17.7244 9.78479Z"
              fill="currentColor"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>
{/if}
