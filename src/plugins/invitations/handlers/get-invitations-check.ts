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

      /**
       * Missing conditions
       */
      if (
        !_invitation.conditions?.maxRedemptions &&
        !_invitation.conditions?.recipients
      ) {
        return new Error('Invitation has no conditions.')
      }

      const validConditions = whenDefinedAll(
        [
          _invitation.conditions?.maxRedemptions,
          _invitation.conditions?.recipients,
        ],
        () => {
          return new Error(
            'Invitation should not have both max redemptions and recipients defined.',
          )
        },
      )

      /**
       * Anonymous invites sent
       * handle max redepemptions
       */
      const validMaxRedemptions = whenDefined(
        _invitation.conditions?.maxRedemptions,
        (redemptions) => {
          if (_history.documents.length >= redemptions) {
            return new Error('Invitation has reached max redemptions.')
          }

          return true
        },
      )

      /**
       * Specified list of addresses for the invitation
       */
      const validRecipients = whenDefined(
        _invitation.conditions?.recipients,
        (recipients) => {
          if (!recipients?.includes(account)) {
            return new Error('Account is not in the recipients list.')
          }

          return true
        },
      )

      // Make sure the invitation has not already been redeemed by the account
      const previouslyRedeemed = Boolean(
        _history.documents.find((x) => x.value?.account === account),
      )

      return (
        validConditions &&
        validMaxRedemptions &&
        validRecipients &&
        !previouslyRedeemed
      )
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
