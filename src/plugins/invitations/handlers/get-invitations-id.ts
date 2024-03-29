import type { APIRoute } from 'astro'
import { aperture } from 'ramda'
import { withCheckingIndex, getDefaultClient } from '../redis'
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
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import { headers } from '@fixtures/api/headers'

export const getInvitationById = async (id: string) => {
  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch((err) => {
    console.log('err is: ', err)
    return err as Error
  })

  // console.log('client is: ', client)

  // Try to fetch the mapped invitation.
  const data = await whenNotErrorAll([id, client], ([_id, _client]) =>
    _client.ft.search(
      Index.Invitation,
      `@${schemaInvitation['$.id'].AS}:{${uuidToQuery(_id)}}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    ),
  )

  const res = whenNotError(
    data,
    (d) =>
      (d.documents.find((x) => x.value)?.value as UndefinedOr<Invitation>) ??
      new Error('ID is not found.'),
  )

  return res
}

const handler: APIRoute = async (req) => {
  // Detect the passed invitation ID
  const [, givenId] =
    aperture(2, req.url.pathname.split('/')).find(
      ([p]) => p === 'invitations',
    ) ?? []

  const id = whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  const res = await whenNotError(id, (_id) => getInvitationById(_id))

  return new Response(JSON.stringify(res), {
    status: isNotError(res) ? 200 : 400,
    headers,
  })
}

export default handler
