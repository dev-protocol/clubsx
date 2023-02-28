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
  <p class="text-center font-bold leading-3 lg:text-2xl	lg:leading-3">
    0<br /><span class="text-sm opacity-50">Members</span>
  </p>
{:else if members === undefined}
  <p
    class="text-center font-bold leading-[.75em] lg:text-2xl lg:leading-[.75em]"
  >
    <span
      class="inline-block h-[3ex] w-14 animate-pulse rounded bg-gray-500/60"
    />
    <br /><span class="text-sm opacity-50">Members</span>
  </p>
{:else}
  <p
    class="text-center font-bold leading-[.75em] lg:text-2xl lg:leading-[.75em]"
  >
    {members}<br /><span class="text-sm opacity-50">Members</span>
  </p>
{/if}
