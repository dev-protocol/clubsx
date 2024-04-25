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

  // fetch all history items for the invitation
  const history = await client.ft
    .search(
      Index.History,
      `@${schemaHistory['$.usedId'].AS}:{${uuidToQuery(id)}}`,
    )
    .catch((err) => err as Error)

  const valid = whenNotErrorAll(
    [history, invItem],
    ([_history, _invitation]) => {
      // Ensure the invitation is retrieved
      if (!_invitation) {
        return new Error('Invitation not found.')
      }

      // Ensure the max redemptions is not reached
      if (
        _history.documents.length >=
        (_invitation?.conditions?.maxRedemptions ?? 0)
      ) {
        return new Error('Invitation has reached max redemptions.')
      }

      // Check if the account is in the recipients list
      if (!_invitation.conditions?.recipients?.includes(account)) {
        return new Error('Account is not in the recipients list.')
      }

      // Make sure the invitation has not already been redeemed by the account
      if (_history.documents.find((x) => x.value?.account === account)) {
        return new Error('Invitation has already been redeemed.')
      }

      return true
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
