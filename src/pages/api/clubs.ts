import { decode } from '@devprotocol/clubs-core'
import { Redis } from '@devprotocol/clubs-core/redis'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import {
  getAllClubByOwnerAddress,
  getAllClubByOwnerFirebaseUid,
  getClubById,
  getClubByProperty,
  withCheckingIndex,
} from '@fixtures/api/club/redis'
import { cache, headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import { isAddress } from 'ethers'

export type ClubsData = {
  id: string
  propertyAddress: string
  url?: string
  avatar?: string
  name?: string
  config: {
    source: string
  }
}

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
 * // => [{ id: 'foo', propertyAddress: '0x1234', config: {source: 'ENCODED_CLUBS_CONFIGURATION'} }, ...]
 * ```
 */
export const GET: APIRoute = async ({ url }): Promise<Response> => {
  const propertyAddresses = url.searchParams.getAll('p')
  const owner = url.searchParams.get('owner')
  const id = url.searchParams.get('id')

  const client = await withCheckingIndex(Redis.client)
  const fromDB = await Promise.all([
    ...propertyAddresses.map((p) => getClubByProperty(p, client)),
    owner
      ? isAddress(owner)
        ? getAllClubByOwnerAddress(owner, client)
        : getAllClubByOwnerFirebaseUid(owner, client)
      : id
        ? getClubById(id, client)
        : undefined,
  ])
  const data = fromDB.flat()
  const res =
    (await whenDefined(data, (allClubs) =>
      Promise.all(
        allClubs.map((club) =>
          whenDefined(
            club,
            async ({ id, propertyAddress }): Promise<ClubsData> => {
              const encoded = await client.get(id)
              const decoded = whenDefined(encoded, decode)
              const source = whenDefined(encoded, (src) => src) ?? ''
              const avatar = decoded?.options?.find(
                (option) => option.key === 'avatarImgSrc',
              )?.value as UndefinedOr<string>
              return {
                id,
                propertyAddress,
                url: decoded?.url,
                name: decoded?.name,
                avatar,
                config: { source },
              }
            },
          ),
        ),
      ),
    )) ?? []
  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { ...headers, ...cache({ maxAge: 604800 }) },
  })
}
