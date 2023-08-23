<script lang="ts">
  import {
    whenDefined,
    type UndefinedOr,
    whenDefinedAll,
  } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistory } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { meta } from './index'
  import { decode } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import Check from './Check.svelte'

  export let ticket: Ticket
  export let membership: UndefinedOr<Membership>

  let sTokensId: UndefinedOr<number>
  let benefits: UndefinedOr<TicketStatus[]>

  onMount(async () => {
    console.log({ ticket, membership })
    const id = Number(new URL(location.href).searchParams.get('id'))
    if (id) {
      sTokensId = id

      const res = await fetch(
        `/api/${meta.id}/history/${ticket.historyDbKey}?id=${id}`,
      )
      const text = res.ok ? await res.text() : undefined
      const history: TicketHistory =
        whenDefined(text, (txt) => decode<TicketHistory>(txt)) ?? []
      benefits = ticketStatus(history, ticket.uses)
    }
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
        <span class="h-8">
          <Skeleton />
        </span>
      {:else}
        {#each benefits as benefit}
          <div class="grid justify-items-center gap-2">
            <button
              data-is-enablable={benefit.enablable}
              data-is-available={benefit.self.available}
              data-is-expired={benefit.self.expired}
              data-is-waiting={!benefit.enablable &&
                benefit.dependency?.available === false}
              disabled={benefit.self.expired || !benefit.enablable}
              class="group flex w-full items-center rounded-full border border-[3px] border-transparent px-8 py-4 text-center text-white data-[is-waiting=true]:border-[#5B8BF5] data-[is-waiting=true]:border-[#5B8BF5] data-[is-available=true]:bg-[#43C451] data-[is-enablable=true]:bg-[#5B8BF5] data-[is-expired=true]:bg-[#C4C4C4] data-[is-waiting=true]:text-[#5B8BF5]"
              ><span
                class="rounded-full border border-[3px] border-transparent text-[#C4C4C4] group-data-[is-waiting=true]:border-[#5B8BF5] group-data-[is-available=true]:bg-[#67CF72] group-data-[is-enablable=true]:bg-white group-data-[is-expired=true]:bg-white group-data-[is-waiting=true]:bg-transparent group-data-[is-available=true]:text-white"
                ><Check />
              </span><span class="flex-grow text-2xl font-bold"
                >{benefit.self.use.description}</span
              ></button
            >
            {#if benefit.enablable}
              <span class="font-bold text-[#5B8BF5] md:text-xl"
                >Sign to use this benefit</span
              >
            {/if}
            {#if benefit.available && benefit.self.expiration}
              <span class="font-bold text-[#43C451] md:text-xl"
                >Available until {benefit.self.expiration.calendar()}</span
              >
            {/if}
            {#if !benefit.enablable && benefit.dependency?.available === false}
              <span class="font-bold text-[#5B8BF5] md:text-xl"
                >Will be available when {benefit.dependency.use.description} is used.</span
              >
            {/if}
          </div>
        {/each}
      {/if}
    {/if}
  </div>
</section>
