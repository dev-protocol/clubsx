import {
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { generateShortifyId } from '@fixtures/api/keys'
import { createClient } from 'redis'
import dayjs from 'dayjs'
import type { APIRoute } from 'astro'
import { tryCatch } from 'ramda'

export const get: APIRoute = async ({ params }) => {
  const id = whenDefined(params.id, (_id) => _id) ?? new Error('id missing')

  const client = await whenNotError(
    createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
      socket: {
        keepAlive: 1,
        reconnectStrategy: 1,
      },
    }),
    (db) =>
      db
        .connect()
        .then(() => db)
        .catch((err) => new Error(err)),
  )

  const key = whenNotError(id, generateShortifyId)
  const value = await whenNotErrorAll([client, key], ([db, k]) => db.get(k))

  const persed = whenNotError(
    value,
    (value$1) =>
      whenDefined(value$1, (val) =>
        tryCatch(
          (v) => JSON.parse(v) as { url: string; exp: string },
          (err: Error) => new Error(err.message ?? err),
        )(val),
      ) ?? new Error('data is not defined'),
  )

  const valid = whenNotError(persed, ({ exp }) =>
    dayjs().isBefore(dayjs(exp)) ? true : new Error('Expired'),
  )

  const result = whenNotErrorAll([valid, persed], ([isValid, { url }]) =>
    isValid ? url : (undefined as never),
  )

  return result instanceof Error
    ? new Response(
        JSON.stringify({
          error: result.message,
        }),
        { status: 400 },
      )
    : new Response(
        JSON.stringify({
          url: result,
        }),
        { status: 200 },
      )
}
