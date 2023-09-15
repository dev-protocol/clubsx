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

  export let tickets: Tickets
  export let memberships: UndefinedOr<Membership[]>
  export let propertyAddress: string
  export let rpcUrl: string

  let account: UndefinedOr<string>
  let ownedTickets: UndefinedOr<TicketWithStatus[]>

  const queueTickets = new PQueue({ concurrency: 3 })
  const queueStatus = new PQueue({ concurrency: 1 })

  type TicketWithStatus = Ticket & {
    id: number
    membership?: Membership
    status?: TicketStatus[] | Promise<TicketStatus[]>
  }

  const detectHavingTickets = async (
    _account: string,
  ): Promise<TicketWithStatus[]> => {
    const provider = new JsonRpcProvider(rpcUrl)
    const [s1, s2] = await clientsSTokens(provider)
    const detectSTokens = whenDefined(s1 ?? s2, client.createDetectSTokens)
    const idList = await whenDefined(detectSTokens, (detector) =>
      detector(propertyAddress, _account),
    )

    console.log({ idList })

    const _tickets = await whenDefined(idList, async (li) => {
      const ss = await Promise.all(
        li
          .toSorted((a, b) => b - a)
          .map(async (id) =>
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
              const res = match
                ? { ...match, id, membership, status }
                : undefined
              return res
            }),
          ),
      )
      return ss.filter(Boolean) as TicketWithStatus[]
    })
    return _tickets ? _tickets : []
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

  onMount(async () => {
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().account.subscribe(async (acc) => {
      account = acc
      if (account) {
        const _ownedTickets = await detectHavingTickets(account)
        ownedTickets = _ownedTickets
      }
    })
  })
</script>

<section class="grid gap-8 rounded-md bg-white p-2 text-black shadow">
  {#if !account}
    <p>Please connect a wallet</p>
  {/if}
  {#if account && ownedTickets === undefined}
    <span class="h-32">
      <Skeleton />
    </span>
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
              class="rounded-full px-4 py-1.5 text-white data-[is-available=true]:bg-dp-green-300 data-[is-enablable=true]:bg-native-blue-400 data-[is-expired=true]:bg-dp-white-600 data-[is-available=true]:after:content-['Available'] data-[is-enablable=true]:after:content-['Use'] data-[is-expired=true]:after:content-['Expired']"
            >
            </span>
          {/await}
        </div>
      </a>
    {/each}
  {/if}
</section>
