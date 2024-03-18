import { whenDefined } from '@devprotocol/util-ts'
import {
  getClub,
  getDefaultClient,
  withCheckingIndex,
} from '@fixtures/api/club/redis'
import type { APIRoute } from 'astro'

/**
 * /api/clubs?p=0x1234&p=0x5678&p=0x9abc
 * @returns {Promise<Response>}
 * @example How to call this API with multiple property addresses
 * ```ts
 * const url = new URL(...)
 * url.searchParams.append('p', '0x1234')
 * url.searchParams.append('p', '0x5678')
 * url.searchParams.append('p', '0x9abc')
 *
 * const response = await fetch(url.toString())
 * const data = await response.json()
 * console.log(data)
 * // => [{ id: 'foo', propertyAddress: '0x1234', encodedConfig: 'ENCODED_CLUBS_CONFIGURATION' }, ...]
 * ```
 */
export const GET: APIRoute = async ({ request, url }): Promise<Response> => {
  const propertyAddresses = url.searchParams.getAll('p')

  const client = await withCheckingIndex(getDefaultClient)
  const data = await Promise.all(
    propertyAddresses.map((p) => getClub(p, client)),
  )
  const res = await whenDefined(data, (allClubs) =>
    Promise.all(
      allClubs.map((club) =>
        whenDefined(club, async ({ id, propertyAddress }) => ({
          id,
          propertyAddress,
          encodedConfig: await client.get(id),
        })),
      ),
    ),
  )

  return new Response(JSON.stringify(res), { status: 200 })
}
