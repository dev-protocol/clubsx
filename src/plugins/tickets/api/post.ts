import type { APIRoute } from 'astro'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import { createClient } from 'redis'
import { decode, encode } from '@devprotocol/clubs-core'
import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import { always } from 'ramda'
import { ticketStatus } from '../utils/status'
import { JsonRpcProvider, hashMessage, recoverAddress } from 'ethers'
import { clientsSTokens } from '@devprotocol/dev-kit'
import { genHistoryKey } from '../utils/gen-key'
import { now } from '../utils/date'
import { Status } from '../utils/webhooks'
import jsonwebtoken from 'jsonwebtoken'
import fetch from 'cross-fetch'

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

    const dbKey = genHistoryKey(propertyAddress, ticket.payload, id)

    const account = recoverAddress(hashMessage(hash), sig)
    const [l1, l2] = await clientsSTokens(new JsonRpcProvider(rpcUrl))
    const owner = await (l1 ?? l2)?.ownerOf(Number(id))
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

    const statuses = ticketStatus(history, ticket.uses)

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

      const webhook = whenDefinedAll(
        [ticket.webhooks?.used?.encrypted, process.env.SALT],
        ([encrypted, salt]) => jsonwebtoken.verify(encrypted, salt) as string,
      )
      await whenDefined(webhook, (base) =>
        fetch(base, {
          method: 'POST',
          body: JSON.stringify({
            status: Status.Used,
            id,
            account,
            benefit: {
              id: benefitId,
              description: beneifit.self.use.description,
            },
          }),
        }).catch((err: Error) => {
          console.log('webhooks.used', { err })
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
