<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
  import { clientsSTokens } from '@devprotocol/dev-kit'

  export let currentPluginIndex: number
  export let memberships: Membership[]
  export let presets: Membership[]
  export let base: string = '/admin'
  export let propertyAddress: string

  let membershipExists = false
  let loading = false

  const fetchPositionsOfProperty = async () => {
    loading = true
    const modalProvider = GetModalProvider()
    const { provider } = await ReConnectWallet(modalProvider)

    if (!provider) {
      loading = false
      return
    }

    const [l1, l2] = await clientsSTokens(provider)

    const contract = l1 ?? l2
    const positions = await contract?.positionsOfProperty(propertyAddress)
    if (!positions) {
      loading = false
      return
    }

    for (const position of positions) {
      const positionPayload = await contract?.payloadOf(position)

      if (!membershipExists && positionPayload) {
        membershipExists = true
        break
      }
    }

    loading = false
  }

  onMount(() => {
    fetchPositionsOfProperty()
  })

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }
</script>

<div>
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-4	"
  >
    {#if memberships.length === 0}
      {#each presets as opt, i}
        <div>
          <MembershipOptionCard
            name={opt.name}
            imagePath={opt.imageSrc}
            ethPrice={opt.price.toString()}
            description={opt.description}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}`}
            href={`${base}/memberships/new/${opt.id}`}>Select</a
          >
        </div>
      {/each}
    {:else}
      <!-- TODO: Display existing memberships -->
      {#each memberships as membership, i}
        <div>
          <MembershipOptionCard
            name={membership.name}
            imagePath={membership.imageSrc}
            ethPrice={membership.price.toString()}
            description={membership.description}
          />
          <a
            class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
            id={`select-opt-${i}`}
            href={`${base}/memberships/${membership.id}`}>Select</a
          >
        </div>
      {/each}
    {/if}
  </div>
</div>
