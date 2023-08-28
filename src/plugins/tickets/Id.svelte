<script lang="ts">
  import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistories } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { meta } from './index'
  import { decode } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import Check from './Check.svelte'
  import { type Signer, hashMessage } from 'ethers'
  import { bytes32Hex } from '@fixtures/data/hexlify'

  export let ticket: Ticket
  export let membership: UndefinedOr<Membership>
  export let sTokensId: UndefinedOr<number>

  let benefits: UndefinedOr<TicketStatus[]>
  let signer: UndefinedOr<Signer>
  let idIsLoading: UndefinedOr<string>
  let idIsError: UndefinedOr<{ id: string; error: string }>

  const onClickABenefit = (benefitId: string) => async () => {
    whenDefined(signer, async (sigr) => {
      idIsLoading = benefitId
      const hash = hashMessage('')
      const sig = await sigr.signMessage(hash).catch((err) => err)
      const opts = { hash, sig, id: sTokensId, benefitId }
      const res = await fetch(
        `/api/${meta.id}/redeem/${bytes32Hex(ticket.payload)}`,
        {
          method: 'POST',
          body: JSON.stringify(opts),
        },
      )
      if (res.ok) {
        await fetchTicketStatus(sTokensId!!)
      } else {
        idIsError = {
          id: benefitId,
          error: ((await res.json()) as { message: string }).message,
        }
      }
      idIsLoading = undefined
    })
  }

  const fetchTicketStatus = async (id: string | number) => {
    const res = await fetch(
      `/api/${meta.id}/history/${bytes32Hex(ticket.payload)}?id=${id}`,
    )
    const text = res.ok ? await res.text() : undefined
    const history: TicketHistories =
      whenDefined(text, (txt) => decode<TicketHistories>(txt)) ?? {}
    benefits = ticketStatus(history, ticket.uses)
    console.log(history, benefits)
  }

  onMount(async () => {
    if (sTokensId) {
      fetchTicketStatus(sTokensId)
    }
  })

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().signer.subscribe((_signer) => {
      signer = _signer
    })
  })
</script>

<section class="rounded-md bg-white p-6 text-black shadow">
  <div class="mx-auto grid max-w-lg gap-8">
    {#if !sTokensId || !membership}
      <p>Error</p>
    {:else}
      <p>#{sTokensId}</p>

      <div class="rounded-lg border border-black/20 bg-black/10 p-4">
        <img
          src={membership.imageSrc}
          alt={membership.name}
          class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
        />
      </div>

      <h2 class="text-2xl font-bold">{ticket.name}</h2>

      {#if benefits === undefined}
        <span class="h-16">
          <Skeleton />
        </span>
        <span class="h-16">
          <Skeleton />
        </span>
        <span class="h-16 w-1/2">
          <Skeleton />
        </span>
      {:else}
        {#each benefits as benefit}
          <div class="grid justify-items-center gap-2">
            <button
              data-is-enablable={benefit.enablable}
              data-is-available={benefit.available}
              data-is-expired={!benefit.enablable && benefit.self.expired}
              data-is-waiting={!benefit.enablable && benefit.dependency?.unused}
              disabled={(!benefit.enablable && benefit.self.expired) ||
                !benefit.enablable ||
                idIsLoading === benefit.self.use.id}
              data-is-loading={idIsLoading === benefit.self.use.id}
              data-is-error={idIsError?.id === benefit.self.use.id}
              class="group flex w-full items-center rounded-full border border-[3px] border-transparent px-8 py-4 text-center text-white data-[is-loading=true]:animate-pulse data-[is-waiting=true]:border-[#5B8BF5] data-[is-waiting=true]:border-[#5B8BF5] data-[is-available=true]:bg-[#43C451] data-[is-enablable=true]:bg-[#5B8BF5] data-[is-error=true]:bg-red-500 data-[is-expired=true]:bg-[#C4C4C4] data-[is-error=true]:text-white data-[is-waiting=true]:text-[#5B8BF5]"
              on:click={onClickABenefit(benefit.self.use.id)}
              ><span
                class="rounded-full border border-[3px] border-transparent text-[#C4C4C4] group-data-[is-waiting=true]:border-[#5B8BF5] group-data-[is-available=true]:bg-[#67CF72] group-data-[is-enablable=true]:bg-white group-data-[is-expired=true]:bg-white group-data-[is-waiting=true]:bg-transparent group-data-[is-available=true]:text-white"
                ><Check />
              </span><span class="flex-grow text-2xl font-bold"
                >{benefit.self.use.description}</span
              ></button
            >
            {#if !idIsError && benefit.enablable}
              <span class="font-bold text-[#5B8BF5] md:text-xl"
                >Sign to use this benefit</span
              >
            {/if}
            {#if !idIsError && benefit.available && benefit.self.expiration}
              <span class="font-bold text-[#43C451] md:text-xl"
                >Available until {benefit.self.expiration
                  .local()
                  .calendar()}</span
              >
            {/if}
            {#if !idIsError && !benefit.enablable && benefit.dependency?.unused}
              <span class="font-bold text-[#5B8BF5] md:text-xl"
                >Will be available when {benefit.dependency.use.description} is used.</span
              >
            {/if}
            {#if idIsError?.id === benefit.self.use.id}
              <span class="font-bold text-red-400 md:text-xl"
                >{idIsError.error}</span
              >
            {/if}
          </div>
        {/each}
      {/if}
    {/if}
  </div>
</section>
