import {
  getClub,
  getDefaultClient,
  withCheckingIndex,
} from '@fixtures/api/club/redis'
import type { APIRoute } from 'astro'

/**
 * /api/clubs?p=0x1234&p=0x5678&p=0x9abc
 * @example How to call this API with multiple property addresses
 * ```ts
 * const url = new URL(...)
 * url.searchParams.append('p', '0x1234')
 * url.searchParams.append('p', '0x5678')
 * url.searchParams.append('p', '0x9abc')
 * ```
 */
export const GET: APIRoute = async ({ request, url }) => {
  const propertyAddresses = url.searchParams.getAll('p')

  const client = await withCheckingIndex(getDefaultClient)
  const data = await Promise.all(
    propertyAddresses.map((p) => getClub(p, client)),
  )

  return new Response(JSON.stringify({ data }), { status: 200 })
}
