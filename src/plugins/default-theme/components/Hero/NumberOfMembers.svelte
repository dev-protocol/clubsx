<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { whenDefined } from '@devprotocol/util-ts'
  import { detectStokensByPropertyAddress } from '@fixtures/dev-kit'
  import { constants, providers } from 'ethers'
  import { onMount } from 'svelte'

  export let propertyAddress: UndefinedOr<string> = undefined
  export let rpcUrl: UndefinedOr<string> = undefined
  export let isInDraft = false
  let members: UndefinedOr<number> = undefined

  onMount(async () => {
    const provider = new providers.JsonRpcProvider(rpcUrl)
    if (!propertyAddress || propertyAddress === constants.AddressZero) {
      return
    }
    const res = await detectStokensByPropertyAddress(provider, propertyAddress)
    members = whenDefined(res, (n) => n.length)
  })
</script>

{#if isInDraft}
  <span
    ><span class="font-bold lg:text-2xl">0</span>
    <span class="lg:text-2xl">members</span></span
  >
{:else if members === undefined}
  <span
    class="inline-block h-[5ex] w-28 animate-pulse rounded bg-gray-500/60"
  />
{:else}
  <span
    ><span class="font-bold lg:text-2xl">{members}</span>
    <span class="lg:text-2xl">members</span></span
  >
{/if}
