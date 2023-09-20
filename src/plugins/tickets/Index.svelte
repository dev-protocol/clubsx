<script lang="ts">
  import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistories, Tickets } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { meta } from './index'
  import { decode } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { JsonRpcProvider } from 'ethers'
  import { bytes32Hex } from '@fixtures/data/hexlify'
  import { client, clientsSTokens } from '@devprotocol/dev-kit'
  import PQueue from 'p-queue'
  import { reverse } from 'ramda'

  export let tickets: Tickets
  export let memberships: UndefinedOr<Membership[]>
  export let propertyAddress: string
  export let rpcUrl: string

  let account: UndefinedOr<string>
  let ownedTickets: UndefinedOr<TicketWithStatus[]>
  let fetchingOwnedTickets = false

  const queueTickets = new PQueue({ concurrency: 3 })
  const queueStatus = new PQueue({ concurrency: 1 })

  type TicketWithStatus = Ticket & {
    id: number
    membership?: Membership
    status?: TicketStatus[] | Promise<TicketStatus[]>
  }

  const detectHavingTickets = async (_account: string): Promise<void> => {
    fetchingOwnedTickets = true
    const provider = new JsonRpcProvider(rpcUrl)
    const [s1, s2] = await clientsSTokens(provider)
    const detectSTokens = whenDefined(s1 ?? s2, client.createDetectSTokens)
    const idList = await whenDefined(detectSTokens, (detector) =>
      detector(propertyAddress, _account),
    )

    console.log({ idList })

    await whenDefined(idList, async (li) => {
      await Promise.all(
        reverse(li).map(async (id) =>
          queueTickets.add(async () => {
            const payload = await whenDefined(s1 ?? s2, (sTokens) =>
              sTokens.payloadOf(id),
            )
            const match = tickets.find(
              (ticket) => payload === bytes32Hex(ticket.payload),
            )
            const status = whenDefined(match, (x) =>
              fetchTicketStatusThrottle(x, id),
            )
            const membership = whenDefined(match, (x) =>
              memberships?.find(
                (m) => bytes32Hex(m.payload) === bytes32Hex(x.payload),
              ),
            )
            const res = match ? { ...match, id, membership, status } : undefined
            ownedTickets =
              whenDefined(res, (x) => [...(ownedTickets ?? []), x]) ??
              ownedTickets
            return res
          }),
        ),
      )
      fetchingOwnedTickets = false
      return
    })
  }

  const fetchTicketStatusThrottle = async (
    ticket: Ticket,
    id: string | number,
  ) => {
    return queueStatus.add(async () => {
      const res = await fetch(
        `/api/${meta.id}/history/${bytes32Hex(ticket.payload)}?id=${id}`,
      )
      const text = res.ok ? await res.text() : undefined
      const history: TicketHistories =
        whenDefined(text, (txt) => decode<TicketHistories>(txt)) ?? {}
      return ticketStatus(history, ticket.uses)
    }) as Promise<TicketStatus[]>
  }

  const isAvailable = (status?: TicketStatus[]) =>
    status?.some((t) => t.available) ?? false
  const isEnablable = (status?: TicketStatus[]) =>
    status?.some((t) => t.enablable) ?? false
  const isExpired = (status?: TicketStatus[]) =>
    status?.every((t) => t.self.expired) ?? false
  const isTempUnavailable = (status?: TicketStatus[]) =>
    status?.some((t) => t.inUnavailableTime) ?? false

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().account.subscribe(async (acc) => {
      account = acc
      if (account) {
        ownedTickets = undefined
        detectHavingTickets(account)
      }
    })
  })
</script>

<section class="grid gap-8 rounded-md bg-white p-2 text-black shadow">
  {#if !account}
    <div class="grid justify-items-center gap-8 p-4">
      <span class="animate-pulse text-dp-white-400"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-24 w-24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
          />
        </svg>
      </span>
      <p class="font-bold text-dp-white-600">Please connect a wallet</p>
    </div>
  {/if}
  {#if ownedTickets !== undefined}
    {#each ownedTickets as ticket}
      <a
        href={`/tickets/${bytes32Hex(ticket.payload)}?id=${ticket.id}`}
        class="grid items-center gap-16 rounded-lg p-6 transition-colors hover:bg-black/10 md:grid-cols-[auto,1fr]"
      >
        <div
          class="aspect-square h-64 rounded-lg border border-black/20 bg-black/10 p-4"
        >
          <img
            src={ticket.membership?.imageSrc}
            alt={ticket.membership?.name}
            class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
          />
        </div>
        <div class="grid justify-items-start gap-2">
          <p class="opacity-70">#{ticket.id}</p>
          <p class="text-2xl font-bold">{ticket.name}</p>
          {#await ticket.status}
            <div class="h-8 w-1/2">
              <Skeleton />
            </div>
          {:then status}
            <span
              data-is-available={isAvailable(status)}
              data-is-enablable={!isAvailable(status) && isEnablable(status)}
              data-is-expired={isExpired(status)}
              data-is-temp-unavailable={isTempUnavailable(status) &&
                !isEnablable(status)}
              class="rounded-full px-4 py-1.5 text-white data-[is-available=true]:bg-dp-green-300 data-[is-enablable=true]:bg-native-blue-400 data-[is-expired=true]:bg-dp-white-600 data-[is-temp-unavailable=true]:bg-dp-black-200 data-[is-available=true]:after:content-['Available'] data-[is-enablable=true]:after:content-['Use_this'] data-[is-expired=true]:after:content-['Expired'] data-[is-temp-unavailable=true]:after:content-['Now_unavailable']"
            >
            </span>
          {/await}
        </div>
      </a>
    {/each}
  {/if}
  {#if fetchingOwnedTickets}
    <span class="h-32 p-8">
      <Skeleton />
    </span>
  {/if}
  {#if account && !fetchingOwnedTickets && !ownedTickets}
    <div class="grid justify-items-center gap-8 p-4">
      <span class="text-dp-white-400"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-24 w-24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
          />
        </svg>
      </span>
      <p class="font-bold">Become a member and get tickets!</p>
      <p>
        <a href="/" class="hs-button is-outlined"
          >Take me back to the homepage</a
        >
      </p>
    </div>
  {/if}
</section>
