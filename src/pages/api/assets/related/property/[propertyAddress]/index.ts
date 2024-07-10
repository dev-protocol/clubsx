import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import type { APIRoute } from 'astro'
import { ASSET_SCHEMA } from '@fixtures/api/assets/schema'
import { getDefaultClient, Index } from '@fixtures/api/assets/redis'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'

export const GET: APIRoute = async (req) => {
  const propertyAddress =
    whenDefined(
      req.params.propertyAddress,
      (propertyAddress) => propertyAddress,
    ) ?? new Error('No Property Address passed')

  const options = {
    size: Number(req.url.searchParams.get('size')) || 10,
    from: Number(req.url.searchParams.get('from')) || 0,
  }

  const client = await getDefaultClient()

  const data = await whenNotError(propertyAddress, (property) =>
    client.ft
      .search(
        Index.Asset,
        `@${ASSET_SCHEMA['$.propertyAddress'].AS}:{${property}}`,
        {
          LIMIT: options,
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
