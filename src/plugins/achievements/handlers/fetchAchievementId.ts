import { aperture } from 'ramda'
import type { APIRoute } from 'astro'

import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

import { AchievementIndex, uuidToQuery } from '../utils'
import { withCheckingIndex, getDefaultClient } from '../db/redis'
import { ACHIEVEMENT_ITEM_SCHEMA, ACHIEVEMENT_INFO_SCHEMA } from '../db/schema'
import {
  type Achievement,
  type AchievementItem,
  type AchievementInfo,
} from '../types'

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
  const achievementItemDocuments = await whenNotErrorAll(
    [achievementId, client],
    ([_id, _client]) =>
      _client.ft.search(
        AchievementIndex.AchievementItem,
        `@${ACHIEVEMENT_ITEM_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}}`,
        {
          LIMIT: {
            from: 0,
            size: 1,
          },
        },
      ),
  )
  const achievementItem = whenNotError(
    achievementItemDocuments,
    (d) =>
      (d.documents.find((x) => x.value)
        ?.value as UndefinedOr<AchievementItem>) ??
      new Error('ID is not found.'),
  )
  const achievementInfoDocuments = await whenNotErrorAll(
    [achievementItem, client],
    ([_achievementItem, _client]) =>
      _client.ft.search(
        AchievementIndex.AchievementInfo,
        `@${ACHIEVEMENT_INFO_SCHEMA['$.id'].AS}:{${uuidToQuery(_achievementItem.achievementInfoId)}}`,
        {
          LIMIT: {
            from: 0,
            size: 1,
          },
        },
      ),
  )
  const achievementInfo = whenNotError(
    achievementInfoDocuments,
    (d) =>
      (d.documents.find((x) => x.value)
        ?.value as UndefinedOr<AchievementInfo>) ??
      new Error('ID is not found.'),
  )

  return new Response(
    JSON.stringify({ ...achievementInfo, ...achievementItem }),
    {
      status:
        isNotError(achievementInfo) && isNotError(achievementItem) ? 200 : 400,
    },
  )
}

export default handler
