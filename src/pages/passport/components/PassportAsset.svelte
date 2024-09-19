<script lang="ts">
  import { always } from 'ramda'
  import { onMount } from 'svelte'
  import { decodeTokenURI } from '@fixtures/nft'
  import { decode } from '@devprotocol/clubs-core'
  import type { ClubsData } from '@pages/api/clubs'
  import { whenDefined } from '@devprotocol/util-ts'
  import { Contract, type ContractRunner } from 'ethers'
  import Skeleton from '@components/Global/Skeleton.svelte'

  import { loadImage, ABI_NFT } from '../utils'
  import type { PassportItem, ImageData } from '../types'

  export let props: {
    item: PassportItem
    provider: ContractRunner
    local: boolean
    classNames?: string
  }

  let assetName: string
  let notFound: boolean = false
  let club: ClubsData | undefined
  let assetImage: ImageData | undefined

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
</script>

{#if !notFound || !props.item}
  <div
    class={`shadow-md rounded-md p-4 grid gap-4 bg-surface-200 ${props.classNames ?? ''}`}
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

    <span class="grid gap-1.5">
      <span>{assetName ?? ''}</span>
      {#if !clubUrl || !clubName}
        <span class="w-full h-3"><Skeleton /></span>
      {:else}
        <a href="clubUrl"><span class="opacity-50">{clubName ?? ''}</span></a>
      {/if}
    </span>
  </div>
{/if}
