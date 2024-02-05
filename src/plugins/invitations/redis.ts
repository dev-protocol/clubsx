import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'
import { Index, Prefix, SchemaKey, schema, schemaId } from './redis-schema'

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
  const currentScm = await client.get(SchemaKey)
  const isSchemaIndexed = currentScm === schemaId
  return isSchemaIndexed
    ? client
    : client.ft
        .dropIndex(Index)
        .then(() =>
          client.ft.create(Index, schema, { ON: 'JSON', PREFIX: Prefix }),
        )
        .then(() => client)
}
