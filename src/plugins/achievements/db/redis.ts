import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'

import {
  ACHIEVEMENT_INFO_SCHEMA,
  ACHIEVEMENT_INFO_SCHEMA_ID,
  ACHIEVEMENT_ITEM_SCHEMA,
  ACHIEVEMENT_ITEM_SCHEMA_ID,
} from './schema'
import {
  AchievementIndex,
  AchievementPrefix,
  AchievementSchemaKey,
} from '../utils'

export const defaultClient = createClient({
  url: import.meta.env.REDIS_URL,
  username: import.meta.env.REDIS_USERNAME ?? '',
  password: import.meta.env.REDIS_PASSWORD ?? '',
  socket: {
    keepAlive: 1,
    reconnectStrategy: 1,
  },
})

export const getDefaultClient = async () => {
  if (defaultClient.isOpen === false) {
    await defaultClient.connect()
  }
  return defaultClient
}

/**
 * Returns a redis client from the given async function with checking the current schema is indexed.
 * @param getClient - a function that returns redis client
 * @returns the redis client
 */
export const withCheckingIndex = async <
  T extends typeof getDefaultClient = typeof getDefaultClient,
>(
  getClient: T,
): Promise<AsyncReturnType<T>> => {
  const client = (await getClient()) as AsyncReturnType<T>
  const currentScmOfInfo = await client.get(
    AchievementSchemaKey.AchievementInfo,
  )
  const currentScmOfItem = await client.get(
    AchievementSchemaKey.AchievementItem,
  )
  const isScmOfInfoIndexed = currentScmOfInfo === ACHIEVEMENT_INFO_SCHEMA_ID
  const isScmOfItemIndexed = currentScmOfItem === ACHIEVEMENT_ITEM_SCHEMA_ID

  const ON = 'JSON'

  return isScmOfInfoIndexed && isScmOfItemIndexed
    ? client
    : Promise.all([
        client.ft.dropIndex(AchievementIndex.AchievementInfo).catch(() => null),
        client.ft.dropIndex(AchievementIndex.AchievementItem).catch(() => null),
      ])
        .then(() =>
          Promise.all([
            client.ft.create(
              AchievementIndex.AchievementInfo,
              ACHIEVEMENT_INFO_SCHEMA,
              {
                ON,
                PREFIX: AchievementPrefix.AchievementInfo,
              },
            ),
            client.ft.create(
              AchievementIndex.AchievementItem,
              ACHIEVEMENT_ITEM_SCHEMA,
              {
                ON,
                PREFIX: AchievementPrefix.AchievementItem,
              },
            ),
          ]),
        )
        .then(() =>
          Promise.all([
            client.set(
              AchievementSchemaKey.AchievementInfo,
              ACHIEVEMENT_INFO_SCHEMA_ID,
            ),
            client.set(
              AchievementSchemaKey.AchievementItem,
              ACHIEVEMENT_ITEM_SCHEMA_ID,
            ),
          ]),
        )
        .then(() => client)
}
