import { aperture } from 'ramda'
import type { APIRoute } from 'astro'

import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

import { type Achievement } from '../types'
import { ACHIEVEMENT_SCHEMA } from '../db/schema'
import { ACHIEVEMENT_INDEX, uuidToQuery } from '../utils'
import { withCheckingIndex, getDefaultClient } from '../db/redis'

const handler: APIRoute = async (req) => {
  // Detect the passed achievement ID
  const [, givenId] =
    aperture(2, req.url.pathname.split('/')).find(
      ([p]) => p === 'achievement',
    ) ?? []
  const achievementId =
    whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch(
    (err) => err as Error,
  )

  // Try to fetch the mapped achievement.
  const data = await whenNotErrorAll(
    [achievementId, client],
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
    data,
    (d) =>
      (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
      new Error('ID is not found.'),
  )

  return new Response(JSON.stringify(achievement), {
    status: isNotError(achievement) ? 200 : 400,
  })
}

export default handler
