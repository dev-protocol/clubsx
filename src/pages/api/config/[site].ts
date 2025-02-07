import { whenDefined, whenNotErrorAll } from '@devprotocol/util-ts'
import type { APIRoute } from 'astro'
import { json } from '@fixtures/api/json'
import { headers } from '@fixtures/api/headers'
import { Redis } from '@devprotocol/clubs-core/redis'

export const GET: APIRoute = async ({ params }) => {
  const props =
    whenDefined(params.site, (site) => ({ site })) ??
    new Error('/config/[site]/ is required')

  const redis = await Redis.client().catch((err) => new Error(err))

  const config = await whenNotErrorAll([props, redis], ([{ site }, client]) =>
    client.get(site).catch((err) => new Error(err)),
  )

  const result = config

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
