import type { APIRoute } from 'astro'
import {
  isMembershipTicket,
  isNFTTicket,
  type Ticket,
  type TicketHistories,
  type TicketHistory,
} from '..'
import { createClient } from 'redis'
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { always } from 'ramda'
import { ticketStatus } from '../utils/status'
import { Contract, JsonRpcProvider, hashMessage, recoverAddress } from 'ethers'
import { clientsSTokens } from '@devprotocol/dev-kit'
import { genHistoryKey } from '../utils/gen-key'
import { now } from '../utils/date'
import { Status } from '../utils/webhooks'
import jsonwebtoken from 'jsonwebtoken'
import fetch from 'cross-fetch'
import { ABI_NFT } from '../utils/nft'

export const post: (opts: {
  ticket: Ticket
  propertyAddress: string
  rpcUrl: string
}) => APIRoute =
  ({ ticket, rpcUrl, propertyAddress }) =>
  async ({ request }) => {
    const { id, benefitId, hash, sig } = (await request.json()) as {
      id?: string
      benefitId?: string
      hash?: string
      sig?: string
    }

    if (!id || !benefitId || !hash || !sig) {
      return new Response(
        JSON.stringify({ message: 'missing required parameters' }),
        {
          status: 404,
        },
      )
    }

    const membershipTicket = isMembershipTicket(ticket) && ticket
    const dbKey = genHistoryKey(
      propertyAddress,
      membershipTicket ? membershipTicket.payload : ticket.erc721Enumerable,
      id,
    )
    const provider = new JsonRpcProvider(rpcUrl)

    const account = recoverAddress(hashMessage(hash), sig)
    const nft = isNFTTicket(ticket)
      ? new Contract(ticket.erc721Enumerable, ABI_NFT, provider)
      : await clientsSTokens(provider).then(([l1, l2]) => l1 ?? l2)
    const owner = await nft?.ownerOf(Number(id))
    const isOwner = owner?.toLowerCase() === account.toLowerCase()

    if (!isOwner) {
      return new Response(JSON.stringify({ message: 'unauthorized' }), {
        status: 401,
      })
    }

    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
      socket: {
        keepAlive: 1,
        reconnectStrategy: 1,
      },
    })
    await client.connect()

    client.on('error', (e) => {
      console.error('redis connection error: ', e)
    })

    const history = await client
      .get(dbKey)
      .then((res) => whenDefined(res, decode<TicketHistories>) ?? {})
      .catch(always({}))

    const statuses = await ticketStatus(history, ticket, {
      tokenId: id,
      erc721Enumerable: isNFTTicket(ticket) ? ticket.erc721Enumerable : false,
      provider,
    })

    const beneifit = statuses.find((status) => status.self.use.id === benefitId)
    if (!beneifit) {
      return new Response(
        JSON.stringify({ message: 'the benefit is not existing' }),
        {
          status: 400,
        },
      )
    }

    const valid = whenDefined(beneifit, (bene) => bene.enablable === true)
    if (!valid) {
      return new Response(
        JSON.stringify({ message: 'the benefit is not enablable' }),
        {
          status: 423,
        },
      )
    }

    const newItem: TicketHistory = {
      datetime: now().toDate(),
    }
    const nextHistory = encode<TicketHistories>({
      ...history,
      [beneifit.self.use.id]: newItem,
    })

    try {
      await client.set(dbKey, nextHistory)
      await client.quit()

      console.log('webhooks.used', 'start', ticket.webhooks?.used)
      const webhook = whenDefinedAll(
        [ticket.webhooks?.used?.encrypted, process.env.SALT],
        ([encrypted, salt]) => jsonwebtoken.verify(encrypted, salt) as string,
      )
      console.log('webhooks.used', 'decrypt', typeof webhook)
      await whenDefined(webhook, (base) =>
        fetch(base, {
          method: 'POST',
          body: JSON.stringify({
            status: Status.Used,
            id,
            account,
            ticket: {
              name: beneifit.ticket.name,
            },
            benefit: {
              id: benefitId,
              name: beneifit.self.use.name,
              description: beneifit.self.use.description,
            },
          }),
        })
          .then(async (res) => {
            console.log('webhooks.used', 'called', {
              res,
              body: await res.text().catch((err) => err),
            })
          })
          .catch((err: Error) => {
            console.log('webhooks.used', 'error', { err })
          }),
      )

      return new Response(null, {
        status: 200,
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: error instanceof Error ? error.message : 'server error',
        }),
        {
          status: 500,
        },
      )
    }
  }
