<script lang="ts">
  import { onMount } from 'svelte'
  import { decode } from '@devprotocol/clubs-core'
  import { whenDefined } from '@devprotocol/util-ts'

  import type { ClubsData } from '@pages/api/clubs'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import type { AssetDocument } from '@fixtures/api/assets/schema'
  import { decodeTokenURI } from '@fixtures/nft'
  import { Contract, type ContractRunner } from 'ethers'
  import { always } from 'ramda'

  type ImageData = {
    src: string
    w: number
    h: number
    alt: string
  }

  export let props: {
    item: AssetDocument | undefined
    provider: ContractRunner
    local: boolean
    classNames?: string
  }

  const ABI_NFT = [
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'function tokenURI(uint256) view returns(string)',
  ]

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

  const loadImage = async (src: string): Promise<ImageData> => {
    const img = await new Promise<ImageData>((res) => {
      const _img = new Image()
      _img.onload = () =>
        res({ src: _img.src, w: _img.width, h: _img.height, alt: _img.alt })
      _img.src = src
    })
    return img
  }

  onMount(async () => {
    const [clubApiPri, uri] = await Promise.all([
      fetch(`/api/clubs?p=${props.item?.propertyAddress}`)
        .then((res) => res.json())
        .then((res) => res[0] as null | ClubsData)
        .catch(always(null)),

      whenDefined(props.item?.id, async (id: string | number) =>
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
      <span>{assetName}</span>
      {#if !clubUrl || !clubName}
        <span class="w-full h-3"><Skeleton /></span>
      {:else}
        <a href="clubUrl"><span class="opacity-50">{clubName}</span></a>
      {/if}
    </span>
  </div>
{/if}
