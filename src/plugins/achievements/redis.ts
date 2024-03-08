import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'
import {
  AchievementIndex,
  AchievementPrefix,
  AchievementSchemaKey,
  schemaAchievementsHistory,
  schemaAchievementsHistoryId,
  schemaAchievement,
  schemaAchievementId,
} from './redis-schema'

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
  const currentScmI = await client.get(AchievementSchemaKey.Achievement)
  const currentScmH = await client.get(AchievementSchemaKey.History)
  const isScmIIndexed = currentScmI === schemaAchievementId
  const isScmHIndexed = currentScmH === schemaAchievementsHistoryId
  const ON = 'JSON'
  return isScmIIndexed && isScmHIndexed
    ? client
    : Promise.all([
        client.ft.dropIndex(AchievementIndex.Achievement),
        client.ft.dropIndex(AchievementIndex.History),
      ])
        .then(() =>
          Promise.all([
            client.ft.create(AchievementIndex.Achievement, schemaAchievement, {
              ON,
              PREFIX: AchievementPrefix.Achievement,
            }),
            client.ft.create(
              AchievementIndex.History,
              schemaAchievementsHistory,
              {
                ON,
                PREFIX: AchievementPrefix.History,
              },
            ),
          ]),
        )
        .then(() => client)
}
