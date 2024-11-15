import { whenNotError, whenNotErrorAll } from '@devprotocol/util-ts'
import { always } from 'ramda'
import { createClient } from 'redis'
import {
  Index,
  sTokenPayload as sTokenPayloadSchema,
  type PassportItemDocument,
} from '@devprotocol/clubs-plugin-passports'

const { REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD } = import.meta.env

export const getPassportItemForPayload = async (props: {
  sTokenPayload: string
}) => {
  const redis = await whenNotError(
    createClient({
      url: REDIS_URL,
      username: REDIS_USERNAME ?? '',
      password: REDIS_PASSWORD ?? '',
    }),
    (db) =>
      db
        .connect()
        .then(always(db))
        .catch((err) => new Error(err)),
  )

  const passportItem = await whenNotErrorAll(
    [props, redis],
    ([{ sTokenPayload }, client]) =>
      client.ft
        .search(
          Index.PassportItem,
          `@${sTokenPayloadSchema['$.sTokenPayload'].AS}:{${sTokenPayload}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        )
        .then((res) =>
          res.total && res.documents.length
            ? (res.documents[0].value as PassportItemDocument)
            : undefined,
        )
        .catch((err) => new Error(err)),
  )

  const result = await whenNotErrorAll([passportItem, redis], ([res, client]) =>
    client
      .quit()
      .then(always(res))
      .catch((err) => new Error(err)),
  )

  return result
}
