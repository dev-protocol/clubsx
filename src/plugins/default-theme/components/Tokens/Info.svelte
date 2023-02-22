<script lang="ts">
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { clientsLockup, clientsProperty } from '@devprotocol/dev-kit'
  import { propertiesAssets } from '@devprotocol/dev-kit/agent'
  import { clientsSTokens } from '@devprotocol/dev-kit/agent'
  import { whenDefined } from '@devprotocol/util-ts'
  import { providers, utils } from 'ethers'
  import { onMount } from 'svelte'
  import YouTube from '@components/Icons/YouTube.svelte'
  import Discord from '@components/Icons/Discord.svelte'
  import GitHub from '@components/Icons/GitHub.svelte'

  export let propertyAddress: string
  export let chainId: number
  export let rpcUrl: string
  let author: string | undefined
  let stakers: number | undefined
  let totalStaked: string | undefined
  let assets:
    | ReadonlyArray<{
        readonly market: string
        readonly marketSlug?: string
        readonly id: string
      }>
    | undefined

  const chainName =
    chainId === 1
      ? 'Ethereum'
      : chainId === 137
      ? 'Polygon'
      : chainId === 80001
      ? 'Polygon Mumbai'
      : chainId === 42161
      ? 'Arbitrum'
      : '(Unsupported chain)'

  const explorerBase =
    chainId === 1
      ? 'https://etherscan.io'
      : chainId === 137
      ? 'https://polygonscan.com'
      : chainId === 80001
      ? 'https://mumbai.polygonscan.com'
      : chainId === 42161
      ? 'https://arbiscan.io'
      : undefined

  const provider = new providers.JsonRpcProvider(rpcUrl)

  const slugToLink = (slug?: string) =>
    slug === 'discord'
      ? 'https://discord.com/channels/'
      : slug === 'youtube'
      ? 'https://www.youtube.com/channel/'
      : slug === 'github'
      ? 'https://github.com/'
      : undefined

  onMount(async () => {
    const [l1, l2] = await clientsProperty(provider, propertyAddress)
    author = await whenDefined(l1 ?? l2, (x) => x.author())
  })

  onMount(async () => {
    assets = await propertiesAssets({
      provider,
      destination: propertyAddress,
    })
    console.log({ assets })
  })

  onMount(async () => {
    const [l1, l2] = await clientsSTokens(provider)
    const positions = await whenDefined(l1 ?? l2, (x) =>
      x.positionsOfProperty(propertyAddress)
    )
    stakers = positions?.length
  })

  onMount(async () => {
    const [l1, l2] = await clientsLockup(provider)
    const tl = await (l1
      ? l1.getPropertyValue(propertyAddress)
      : l2
      ? l2.totalLockedForProperty(propertyAddress)
      : undefined)
    totalStaked = whenDefined(tl, (v) => utils.formatEther(v).toString())
  })
</script>

<dl
  class="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-y-2 rounded border border-white/30 bg-black/20 p-2 text-sm"
>
  <dt>Token</dt>
  <dd class="truncate">
    <span>{propertyAddress}</span>
    {#if explorerBase}
      <span class="block"
        ><a
          href={`${explorerBase}/token/${propertyAddress}`}
          target="_blank"
          class="inline-block rounded bg-white/20 p-1 text-xs"
          rel="noopener noreferrer">View token in explorer ↗</a
        ></span
      >
    {/if}
  </dd>
  <dt>Author</dt>
  <dd class="truncate">
    {#if author === undefined}<Skeleton />{:else}<span>{author}</span>
      {#if explorerBase}
        <span class="block"
          ><a
            href={`${explorerBase}/address/${author}`}
            target="_blank"
            class="inline-block rounded bg-white/20 p-1 text-xs"
            rel="noopener noreferrer">View account in explorer ↗</a
          ></span
        >
      {/if}
    {/if}
  </dd>
  <dt>Tokenized assets</dt>
  <dd>
    {#if chainId === 1}
      <span class="text-xs">(This data is not supported on Ethereum)</span>
    {:else if assets === undefined}<Skeleton />{:else}<ul>
        {#each assets as asset}
          <li>
            {#if slugToLink(asset.marketSlug)}
              <a
                href={`${slugToLink(asset.marketSlug)}${asset.id}`}
                target="_blank"
                class="flex items-center gap-2"
                rel="noopener noreferrer"
              >
                {#if asset.marketSlug === 'github'}
                  <GitHub />
                {:else if asset.marketSlug === 'discord'}
                  <Discord />
                {:else if asset.marketSlug === 'youtube'}
                  <YouTube />
                {/if}
                {asset.id}
              </a>
            {:else}
              {asset.id}
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </dd>
  <dt>Chain</dt>
  <dd>{chainName}</dd>
  <dt>Stakers</dt>
  <dd>
    {#if stakers === undefined}<Skeleton />{:else}<span>{stakers}</span>
    {/if}
  </dd>
  <dt>Total staked</dt>
  <dd>
    {#if totalStaked === undefined}<Skeleton />{:else}<span
        >{totalStaked} DEV</span
      >
    {/if}
  </dd>
</dl>

<style lang="scss">
  dt {
    @apply pr-2 font-bold;
  }
  dt,
  dd {
    @apply border-b border-white/30 pb-2;
    &:last-of-type {
      @apply border-0 pb-0;
    }
  }
</style>
