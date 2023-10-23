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

const { REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD } = import.meta.env

export const GET: APIRoute = async ({ params }) => {
  const props =
    whenDefined(params.site, (site) => ({ site })) ??
    new Error('/config/[site]/ is required')

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

  const config = await whenNotErrorAll([props, redis], ([{ site }, client]) =>
    client.get(site).catch((err) => new Error(err)),
  )

  const result = await whenNotErrorAll([config, redis], ([res, client]) =>
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
    : new Response(json({ content: result, message: 'success' }), {
        status: 200,
        headers,
      })
}
