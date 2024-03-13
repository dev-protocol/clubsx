import { aperture } from 'ramda'
import { type APIRoute } from 'astro'

import {
  isNotError,
  whenDefined,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

import { ACHIEVEMENT_SCHEMA } from '../db/schema'
import { type Achievement } from '../types'
import { ACHIEVEMENT_INDEX, uuidToQuery } from '../utils'
import { getDefaultClient, withCheckingIndex } from '../db/redis'

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

  // Detect the passed achievement ID
  const [, givenId] =
    aperture(2, req.url.pathname.split('/')).find(([p]) => p === 'check') ?? []
  const achievementId =
    whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch(
    (err) => err as Error,
  )

  const achievementDocuments = await whenNotErrorAll(
    [achievementId, client, props],
    ([_id, _client]) =>
      _client.ft.search(
        ACHIEVEMENT_INDEX,
        `@${ACHIEVEMENT_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}}`,
        {
          LIMIT: {
            from: 0,
            size: 1,
          },
        },
      ),
  )
  const achievement = whenNotError(
    achievementDocuments,
    (d) =>
      (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
      new Error('ID is not found.'),
  )

  return new Response(
    JSON.stringify({
      available: isNotError(achievement) ? achievement.claimed : false,
    }),
    {
      status: isNotError(achievement) ? 200 : 400,
    },
  )
}

export default handler
