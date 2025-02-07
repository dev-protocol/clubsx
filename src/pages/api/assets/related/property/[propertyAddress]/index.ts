import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import type { APIRoute } from 'astro'
import {
  ASSET_SCHEMA,
  assetDocumentTypes,
  type AssetDocument,
} from '@fixtures/api/assets/schema'
import { Index } from '@fixtures/api/assets/redis'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'
import { Redis } from '@devprotocol/clubs-core/redis'

export const GET: APIRoute = async (req) => {
  const propertyAddress =
    whenDefined(
      req.params.propertyAddress,
      (propertyAddress) => propertyAddress,
    ) ?? new Error('No Property Address passed')

  const options = {
    size: Number(req.url.searchParams.get('size')) || 10,
    from: Number(req.url.searchParams.get('from')) || 0,
    type: req.url.searchParams.get('type'),
  }

  const type = whenDefined(options.type, (ty) =>
    assetDocumentTypes.some((x) => x === ty)
      ? (ty as AssetDocument['type'])
      : undefined,
  )

  const client = await Redis.client()

  const data = await whenNotError(propertyAddress, (property) =>
    client.ft
      .search(
        Index.Asset,
        `@${ASSET_SCHEMA['$.propertyAddress'].AS}:{${property}}${type ? ` @${ASSET_SCHEMA['$.type'].AS}:{${type}}` : ''}`,
        {
          LIMIT: {
            size: options.size,
            from: options.from,
          },
          SORTBY: { BY: ASSET_SCHEMA['$.n_block'].AS, DIRECTION: 'DESC' },
        },
      )
      .catch((err: Error) => err),
  )

  const res = whenNotError(data, (_data) => ({
    data: [..._data.documents.map(({ value }) => value)],
    total: _data.total,
    last: options.from + options.size - 1,
  }))

  return new Response(
    isNotError(res)
      ? json(res as JSON)
      : json({ data: [], error: res.message }),
    {
      status: isNotError(res) ? 200 : 400,
      headers,
    },
  )
}
