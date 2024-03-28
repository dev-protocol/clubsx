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

import { type AchievementItem } from '../types'
import { ACHIEVEMENT_ITEM_SCHEMA } from '../db/schema'
import {
  AchievementIndex,
  checkForExistingAchievementInfo,
  uuidToQuery,
} from '../utils'
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
  const achievementItemId =
    whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await withCheckingIndex(getDefaultClient).catch(
    (err) => err as Error,
  )

  const achievementItemDocuments = await whenNotErrorAll(
    [achievementItemId, client, props],
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
  const doesachievementInfoExists = await whenNotError(
    achievementItem,
    (aI) =>
      whenDefined(
        aI,
        async (_aI) =>
          await checkForExistingAchievementInfo(_aI.achievementInfoId),
      ) ?? false,
  )

  return new Response(
    JSON.stringify({
      available:
        isNotError(achievementItem) && isNotError(doesachievementInfoExists)
          ? doesachievementInfoExists && achievementItem.claimed
          : false,
    }),
    {
      status:
        isNotError(achievementItem) && isNotError(doesachievementInfoExists)
          ? 200
          : 400,
    },
  )
}

export default handler
