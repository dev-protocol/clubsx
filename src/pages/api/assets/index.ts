import { cache, headers } from '@fixtures/api/headers'
import { json } from '@fixtures/api/json'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  return new Response(json({}), {
    status: 200,
    headers,
  })
}
