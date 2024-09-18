import {
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import type { APIRoute } from 'astro'
import { always } from 'ramda'
import { createClient } from 'redis'
import { json } from '@fixtures/api/json'
import { headers } from '@fixtures/api/headers'
import {
  Index,
  sTokenPayload as sTokenPayloadSchema,
  type PassportItemDocument,
} from '@devprotocol/clubs-plugin-passport'

const { REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD } = import.meta.env

export const GET: APIRoute = async ({ params }) => {
  const props =
    whenDefined(params.sTokenPayload, (sTokenPayload) => ({ sTokenPayload })) ??
    new Error('/passportItem/[sTokenPayload]/ is required')

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

  return result instanceof Error
    ? new Response(json({ content: null, message: result.message }), {
        status: 400,
        headers,
      })
    : new Response(json({ content: result ?? null, message: 'success' }), {
        status: 200,
        headers,
      })
}
