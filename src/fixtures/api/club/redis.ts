import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'
import { CLUB_SCHEMA, CLUB_SCHEMA_ID, type ClubDocument } from './schema'
import { type UndefinedOr } from '@devprotocol/util-ts'
import { mergeDeepRight, tryCatch } from 'ramda'
import { Redis } from '@upstash/redis'

const upstash = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export enum Index {
  Club = 'idx::clubs:club',
}

export enum Prefix {
  Club = 'doc::clubs:clubs::',
}

export enum SchemaKey {
  Club = 'scm::clubs:club',
}

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

export const withCheckingIndex = async <
  T extends typeof getDefaultClient = typeof getDefaultClient,
>(
  getClient: T,
): Promise<AsyncReturnType<T>> => {
  const client = (await getClient()) as AsyncReturnType<T>
  const scm = await client.get(SchemaKey.Club)
  const isScmIndexed = scm === CLUB_SCHEMA_ID

  const ON = 'JSON'

  return isScmIndexed
    ? client
    : Promise.all([client.ft.dropIndex(Index.Club).catch(() => null)])
        .then(() =>
          Promise.all([
            client.ft.create(Index.Club, CLUB_SCHEMA, {
              ON,
              PREFIX: Prefix.Club,
            }),
            client.set(SchemaKey.Club, CLUB_SCHEMA_ID),
          ]),
        )
        .then(() => client)
}

const loop = async (
  start: number,
  list: readonly ClubDocument[],
  query: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<readonly ClubDocument[]> => {
  const limit = 100
  const result = await client.ft.search(Index.Club, query, {
    LIMIT: { from: start, size: limit },
  })
  const docs: readonly ClubDocument[] = [
    ...list,
    ...result.documents.map(({ value }) => {
      return { ...value } as ClubDocument
    }),
  ]
  const isAll: boolean = result.total <= start + limit

  return isAll ? docs : await loop(start + limit + 1, docs, query, client)
}
const getAll = async (
  query: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<readonly ClubDocument[]> => loop(0, [], query, client)

export const getClubByProperty = async (
  propertyAddress: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ClubDocument>> => {
  const search = await client.ft.search(
    Index.Club,
    `@${CLUB_SCHEMA['$.propertyAddress'].AS}:{${propertyAddress}}`,
    {
      LIMIT: { from: 0, size: 1 },
    },
  )
  return search.documents[0]?.value as UndefinedOr<ClubDocument>
}

export const getAllClubByOwnerAddress = async (
  ownerAddress: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ReadonlyArray<ClubDocument>>> => {
  return getAll(
    `@${CLUB_SCHEMA['$.owner.address'].AS}:{${ownerAddress}}`,
    client,
  )
}

export const getAllClubByOwnerFirebaseUid = async (
  firebaseUid: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ReadonlyArray<ClubDocument>>> => {
  return getAll(
    `@${CLUB_SCHEMA['$.owner.firebaseUid'].AS}:{${firebaseUid}}`,
    client,
  )
}

export const getClubById = async (
  id: string,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<UndefinedOr<ClubDocument>> => {
  const search = await client.ft.search(
    Index.Club,
    `@${CLUB_SCHEMA['$.id'].AS}:{${id.replaceAll('-', '\\-')}}`,
    {
      LIMIT: { from: 0, size: 1 },
    },
  )
  return search.documents[0]?.value as UndefinedOr<ClubDocument>
}

export const updateClubId = async (
  doc: ClubDocument,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<true | Error> => {
  const key = `${Prefix.Club}${doc.id}`
  const [old, edgeConfigHas] = await Promise.all([
    getClubById(doc.id, client),
    upstash.exists(doc.id).then((r) => r > 0),
  ])
  const next = mergeDeepRight(old ?? {}, doc)
  const [set, tenantnames] = await Promise.all([
    client.json.set(key, '$', next),
    edgeConfigHas ? Promise.resolve(undefined) : upstash.set(doc.id, 1),
  ])

  return set === 'OK' && (tenantnames === undefined || tenantnames === 'OK')
    ? true
    : new Error('Error')
}
