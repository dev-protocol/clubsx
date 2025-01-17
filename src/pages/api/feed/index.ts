import type { APIRoute } from 'astro'

import { json } from '@fixtures/api/json'
import { getFeed } from '@fixtures/api/feed'
import { headers } from '@fixtures/api/headers'

export const GET: APIRoute = async ({ params }) => {
  const result = await getFeed()
    .then((feed) => feed)
    .catch((err) => new Error(err))

  return result instanceof Error
    ? new Response(json({ content: null, message: result.message }), {
        status: 400,
        headers,
      })
    : new Response(JSON.stringify({ content: result, message: 'success' }), {
        status: 200,
        headers,
      })
}
