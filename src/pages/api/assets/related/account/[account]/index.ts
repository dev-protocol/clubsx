import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import type { APIRoute } from 'astro'
import {
  ASSET_SCHEMA,
  assetDocumentTypes,
  type AssetDocument,
} from '@fixtures/api/assets/schema'
import { getDefaultClient, Index } from '@fixtures/api/assets/redis'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'

export const GET: APIRoute = async (req) => {
  const accountAddress =
    whenDefined(req.params.account, (addr) => addr) ??
    new Error('No Account Address passed')

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

  const client = await getDefaultClient()

  const data = await whenNotError(accountAddress, (addr) =>
    client.ft
      .search(
        Index.Asset,
        `@${ASSET_SCHEMA['$.owner'].AS}:{${addr}}${type ? ` @${ASSET_SCHEMA['$.type'].AS}:{${type}}` : ''}`,
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

  await client.quit()

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
