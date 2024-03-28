import { createClient } from 'redis'
import type { AsyncReturnType } from 'type-fest'
import { CLUB_SCHEMA, CLUB_SCHEMA_ID, type ClubDocument } from './schema'
import type { UndefinedOr } from '@devprotocol/util-ts'

export enum Index {
  Club = 'idx::clubs:club',
}

export enum Prefix {
  Club = 'doc::clubs:clubs::',
}

export enum SchemaKey {
  Club = 'scm::clubs:club',
}

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

export const getClub = async (
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
  const res = search.documents[0]?.value as UndefinedOr<ClubDocument>
  return res
}

export const setClubId = async (
  doc: ClubDocument,
  client: AsyncReturnType<typeof getDefaultClient>,
): Promise<true | Error> => {
  const set = await client.json.set(
    `${Prefix.Club}${doc.propertyAddress}`,
    '$',
    doc,
  )

  return set === 'OK' ? true : new Error('Error')
}
