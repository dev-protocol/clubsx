import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'
import { CONTENT_INFO_SCHEMA, CONTENT_INFO_SCHEMA_ID, type ContentDocument } from './schema'
import { ContentIndex, ContentPrefix, ContentSchemaKey } from '../utils'
import { mergeDeepRight } from 'ramda'
import type { UndefinedOr } from '@devprotocol/util-ts'

export const defaultClient = () =>
  createClient({
    url: import.meta.env.REDIS_URL,
    username: import.meta.env.REDIS_USERNAME ?? '',
    password: import.meta.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: 1,
    },
  })

export const getDefaultClient = async () => {
  const redis = defaultClient()
  if (redis.isOpen === false) {
    await redis.connect()
  }
  return redis
}

export type DefaultClient = Awaited<ReturnType<typeof getDefaultClient>>

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
  const [currentScmOfInfo] = await Promise.all([
    client.get(ContentSchemaKey.ContentInfo),
  ])
  const isScmOfInfoIndexed = currentScmOfInfo === CONTENT_INFO_SCHEMA_ID

  const ON = 'JSON'

  return isScmOfInfoIndexed
    ? client
    : Promise.all([
        client.ft.dropIndex(ContentIndex.ContentInfo).catch(() => null),
      ])
        .then(() =>
          Promise.all([
            client.ft.create(ContentIndex.ContentInfo, CONTENT_INFO_SCHEMA, {
              ON,
              PREFIX: ContentPrefix.ContentInfo,
            }),
          ]),
        )
        .then(() =>
          Promise.all([
            client.set(ContentSchemaKey.ContentInfo, CONTENT_INFO_SCHEMA_ID),
          ]),
        )
        .then(() => client)
}
export const getContentByPayload = async (
  sTokenPayload: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ContentDocument>> => {
  const search = await client.ft.search(
    ContentIndex.ContentInfo,
    `@${CONTENT_INFO_SCHEMA['$.sTokenPayload'].AS}:{${sTokenPayload}`,
    {
      LIMIT: { from: 0, size: 1 },
    },
  )
  return search.documents[0]?.value as UndefinedOr<ContentDocument>
}

export const getContentByPayloadLatest = async (
  sTokenPayload: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ContentDocument>> => {
  const search = await client.ft.search(
    ContentIndex.ContentInfo,
    `@${CONTENT_INFO_SCHEMA['$.sTokenPayload'].AS}:{${sTokenPayload}`,
    {
      LIMIT: { from: 0, size: 1 },
      SORTBY: {
        BY: CONTENT_INFO_SCHEMA['$.createdOnTimestamp'].AS,
        DIRECTION: 'DESC',
      },
    },
  )
  console.log({search})
  return search.documents[0]?.value as UndefinedOr<ContentDocument>
}

export const updateContentByPayload = async (
  info: ContentDocument,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<true | Error> => {
  const key = `${ContentPrefix.ContentInfo}${info.sTokenPayload}`
  const old = await getContentByPayload(info.sTokenPayload, client)
  const next = mergeDeepRight(old ?? {}, info)
  const set = await client.json.set(key, '$', next)

  return set === 'OK' ? true : new Error('Error')
}

export const generateContentInfoItemKey = (sTokenPayload: string) =>
  `${ContentPrefix.ContentInfo}${sTokenPayload}`