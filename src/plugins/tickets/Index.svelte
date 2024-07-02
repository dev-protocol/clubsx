<script lang="ts">
  import {
    whenDefined,
    type UndefinedOr,
    isNotError,
  } from '@devprotocol/util-ts'
  import type { Ticket, TicketHistories, Tickets } from '.'
  import type { Membership } from '@plugins/memberships'
  import { onMount } from 'svelte'
  import { isMembershipTicket, isNFTTicket, meta } from './index'
  import { decode, i18nFactory } from '@devprotocol/clubs-core'
  import { type TicketStatus, ticketStatus } from './utils/status'
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { JsonRpcProvider } from 'ethers'
  import { bytes32Hex } from '@devprotocol/clubs-core'
  import { client, clientsSTokens } from '@devprotocol/dev-kit'
  import PQueue from 'p-queue'
  import { reverse } from 'ramda'
  import type { BanningRules } from './utils/get-banning-rules'
  import { getAllOwnedTokens } from './utils/nft'
  import { requestToGetHistory } from './utils/api'
  import { Strings } from './i18n'

  export let tickets: Tickets
  export let memberships: UndefinedOr<Membership[]>
  export let enumerableNFTs: string[]
  export let propertyAddress: string
  export let rpcUrl: string
  export let ban: BanningRules

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  let account: UndefinedOr<string>
  let ownedTickets: UndefinedOr<TicketWithStatus[]>
  let fetchingOwnedTickets = false

  const queueTickets = new PQueue({ concurrency: 3 })
  const queueStatus = new PQueue({ concurrency: 1 })
  const provider = new JsonRpcProvider(rpcUrl)
  const UN = undefined

  type TicketWithStatus = Ticket & {
    id: number
    membership?: Membership
    status?: TicketStatus[] | Promise<TicketStatus[]>
  }

  const detectHavingTickets = async (_account: string): Promise<void> => {
    if (fetchingOwnedTickets) return

    fetchingOwnedTickets = true
    const [s1, s2] = await clientsSTokens(provider)
    const detectSTokens = whenDefined(s1 ?? s2, client.createDetectSTokens)
    const idList =
      (await whenDefined(detectSTokens, (detector) =>
        detector(propertyAddress, _account),
      )) ?? []
    const nftList = (
      await Promise.all(
        enumerableNFTs.map((addr) =>
          getAllOwnedTokens(addr, _account, provider),
        ),
      )
    ).flat()

    const filteredIdList = [...idList, ...nftList].filter(
      (i) => ban.id.includes(typeof i === 'number' ? i : i.id) === false,
    )

    console.log({ idList, filteredIdList, nftList })

    await whenDefined(filteredIdList, async (li) => {
      await Promise.all(
        reverse(li).map(async (token) => {
          return queueTickets.add(async () => {
            const [id, payload, contract, metadata] =
              typeof token === 'number'
                ? [
                    token,
                    await whenDefined(s1 ?? s2, (sTokens) =>
                      sTokens.payloadOf(token),
                    ),
                    UN,
                  ]
                : [token.id, UN, token.contract, token]
            const match = tickets.find((ticket) =>
              isMembershipTicket(ticket)
                ? payload === bytes32Hex(ticket.payload)
                : contract === ticket.erc721Enumerable,
            )
            const status = whenDefined(match, (x) =>
              fetchTicketStatusThrottle(x, id),
            )
            const membership = whenDefined(match, (tckt) =>
              isMembershipTicket(tckt)
                ? memberships?.find(
                    (m) => bytes32Hex(m.payload) === bytes32Hex(tckt.payload),
                  )
                : whenDefined(
                    isNotError(metadata?.metadata)
                      ? metadata?.metadata
                      : undefined,
                    ({ image, name, description }) =>
                      ({
                        imageSrc: image,
                        name,
                        description,
                      }) as Membership,
                  ),
            )
            const res = match ? { ...match, id, membership, status } : undefined
            ownedTickets = whenDefined(res, (x) => [
              ...new Set([...(ownedTickets ?? []), x]),
            ]) ?? [...new Set(ownedTickets)]
            return res
          })
        }),
      )
      fetchingOwnedTickets = false
      return
    })

    console.log('Owned tickets', ownedTickets)
  }

  const fetchTicketStatusThrottle = async (
    ticket: Ticket,
    id: string | number,
  ) => {
    return queueStatus.add(async () => {
      const res = await requestToGetHistory(ticket, id)
      const text = res.ok ? await res.text() : undefined
      const history: TicketHistories =
        whenDefined(text, (txt) => decode<TicketHistories>(txt)) ?? {}
      return ticketStatus(history, ticket, {
        tokenId: id,
        erc721Enumerable: isNFTTicket(ticket) ? ticket.erc721Enumerable : false,
        provider,
      })
    }) as Promise<TicketStatus[]>
  }

  const isAvailable = (status?: TicketStatus[]) =>
    status?.some((t) => t.available) ?? false
  const isEnablable = (status?: TicketStatus[]) =>
    status?.some((t) => t.enablable) ?? false
  const isExpired = (status?: TicketStatus[]) =>
    status?.every((t) => t.self.expired) ?? false
  const isTempUnavailable = (status?: TicketStatus[]) =>
    status?.some((t) => t.isTempUnavailable) ?? false

  onMount(async () => {
    i18n = i18nBase(navigator.languages)

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
        href={`/tickets/${isMembershipTicket(ticket) ? bytes32Hex(ticket.payload) : ticket.erc721Enumerable}?id=${ticket.id}`}
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
      <p class="font-bold">{i18n('BecomeMemberGetTickets')}</p>
      <p>
        <a href="/" class="hs-button is-outlined">{i18n('BackToHomepage')}</a>
      </p>
    </div>
  {/if}
</section>
