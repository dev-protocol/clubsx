import type { APIRoute } from 'astro'
import { aperture } from 'ramda'
import { getDefaultClient } from '../redis'
import {
  Index,
  Prefix,
  schemaInvitation,
  schemaHistory,
  uuidToQuery,
  type Invitation,
  type History,
} from '../redis-schema'
import {
  isNotError,
  whenDefined,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import type { AsyncReturnType } from 'type-fest'
import { withCheckingIndex } from '../redis'

export const check = async ({
  id,
  account,
  client,
}: {
  id: string
  account: string
  client: AsyncReturnType<typeof withCheckingIndex>
}) => {
  // Try to fetch the mapped invitation.
  const invitation = await client.ft
    .search(
      Index.Invitation,
      `@${schemaInvitation['$.id'].AS}:{${uuidToQuery(id)}}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )
    .catch((err) => err as Error)
  const invItem = whenNotError(
    invitation,
    (d) =>
      (d.documents.find((x) => x.value)?.value as UndefinedOr<Invitation>) ??
      new Error('ID is not found.'),
  )

  // Try to fetch the history.
  const history = await client.ft
    .search(
      Index.History,
      `@${schemaHistory['$.usedId'].AS}:{${uuidToQuery(id)}} @${schemaHistory['$.account'].AS}:{${uuidToQuery(account)}}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )
    .catch((err) => err as Error)
  const historyItem = whenNotError(
    history,
    (d) => d.documents.find((x) => x.value)?.value as UndefinedOr<History>,
  )

  const valid = whenNotErrorAll(
    [invItem, historyItem],
    ([_invitation, _history]) => {
      return typeof _history === 'undefined'
        ? true
        : new Error('ID is already used.')
    },
  )

  return valid
}

const handler: APIRoute = async (req) => {
  const body = await req.request
    .json()
    .then((r) => r as { account?: string })
    .catch((err) => err as Error)
  const props = whenNotError(
    body,
    (_body) =>
      whenDefinedAll([_body.account], ([account]) => ({ account })) ??
      new Error('Missing parameters.'),
  )

  // Detect the passed invitation ID
  const [, givenId] =
    aperture(2, req.url.pathname.split('/')).find(([p]) => p === 'check') ?? []

  const id = whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch(
    (err) => err as Error,
  )

  const res = await whenNotErrorAll(
    [id, client, props],
    ([_id, _client, { account }]) =>
      check({ id: _id, client: _client, account }),
  )

  return new Response(JSON.stringify(res), {
    status: isNotError(res) ? 200 : 400,
  })
}

export default handler
