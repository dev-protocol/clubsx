import type { APIRoute } from 'astro'
import { aperture } from 'ramda'
import { withCheckingIndex, getDefaultClient } from '../redis'
import {
  AchievementIndex,
  schemaAchievement,
  uuidToQuery,
  type Achievement,
} from '../redis-schema'
import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

const handler: APIRoute = async (req) => {
  // Detect the passed achievement ID
  const [, givenId] =
    aperture(2, req.url.pathname.split('/')).find(
      ([p]) => p === 'invitations',
    ) ?? []

  const id = whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch(
    (err) => err as Error,
  )

  // Try to fetch the mapped invitation.
  const data = await whenNotErrorAll([id, client], ([_id, _client]) =>
    _client.ft.search(
      AchievementIndex.Achievement,
      `@${schemaAchievement['$.id'].AS}:{${uuidToQuery(_id)}}`,
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
      (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
      new Error('ID is not found.'),
  )

  return new Response(JSON.stringify(res), {
    status: isNotError(res) ? 200 : 400,
  })
}

export default handler
