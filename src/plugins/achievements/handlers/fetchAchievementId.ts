import {
  isNotError,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

import { getDefaultClient } from '../db/redis'
import {
  AchievementIndex,
  AchievementPrefix,
  getIdFromURL,
  uuidToQuery,
} from '../utils'
import { ACHIEVEMENT_ITEM_SCHEMA, ACHIEVEMENT_INFO_SCHEMA } from '../db/schema'
import { type AchievementItem, type AchievementInfo } from '../types'
import type { APIRoute } from 'astro'

export const handler =
  (): APIRoute =>
  async ({ url }) => {
    const achievementId = getIdFromURL(url)
    if (!achievementId) {
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
      })
    }

    // 2. Generate a redis client.
    const client = await getDefaultClient()
    if (!client) {
      return new Response(JSON.stringify({ error: 'Missing client' }), {
        status: 400,
      })
    }

    // 3. Try to fetch the mapped achievement.
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
    const achievementInfoDocument = await whenNotErrorAll(
      [achievementItem, client],
      ([_achievementItem, _client]) =>
        _client.json.get(
          `${AchievementPrefix.AchievementInfo}::${_achievementItem.achievementInfoId}`,
        ),
    )
    const achievementInfo = whenNotError(
      achievementInfoDocument,
      (d) =>
        (d as UndefinedOr<AchievementInfo>) ?? new Error('ID is not found.'),
    )

    return new Response(
      isNotError(achievementInfo) && isNotError(achievementItem)
        ? JSON.stringify({
            ...achievementItem,
            ...achievementInfo,
            achievementId: achievementItem.id,
            achievementInfoId: achievementInfo.id,
          })
        : JSON.stringify({ error: 'Invalid data found' }),
      {
        status:
          isNotError(achievementInfoDocument) && isNotError(achievementItem)
            ? 200
            : 500,
      },
    )
  }
