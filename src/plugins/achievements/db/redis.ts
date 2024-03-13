import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'

import { ACHIEVEMENT_SCHEMA, ACHIEVEMENT_SCHEMA_ID } from './schema'
import {
  ACHIEVEMENT_INDEX,
  ACHIEVEMENT_PREFIX,
  ACHIEVEMENT_SCHEMA_KEY,
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
  const currentScmI = await client.get(ACHIEVEMENT_SCHEMA_KEY)
  const isScmIIndexed = currentScmI === ACHIEVEMENT_SCHEMA_ID
  const ON = 'JSON'
  return isScmIIndexed
    ? client
    : Promise.all([client.ft.dropIndex(ACHIEVEMENT_INDEX)])
        .then(() =>
          Promise.all([
            client.ft.create(ACHIEVEMENT_INDEX, ACHIEVEMENT_SCHEMA, {
              ON,
              PREFIX: ACHIEVEMENT_PREFIX,
            }),
          ]),
        )
        .then(() => client)
}
