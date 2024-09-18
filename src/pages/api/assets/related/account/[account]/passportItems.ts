import type { APIRoute } from 'astro'
import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import {
  generatePassportItemKey,
  type PassportItemDocument,
} from '@devprotocol/clubs-plugin-passport'

import { headers } from '@fixtures/api/headers'
import { json, type JSON } from '@fixtures/api/json'
import {
  getDefaultClient,
  Index as AssetIndex,
} from '@fixtures/api/assets/redis'
import { ASSET_SCHEMA, type AssetDocument } from '@fixtures/api/assets/schema'

export const GET: APIRoute = async (req) => {
  const accountAddress =
    whenDefined(req.params.account, (addr) => addr) ??
    new Error('No Account Address passed')

  const options = {
    size: Number(req.url.searchParams.get('size')) || 10,
    from: Number(req.url.searchParams.get('from')) || 0,
    type: 'passportItem',
  }

  const client = await getDefaultClient().catch((err: Error) => err)

  const passportItemAssets = await whenNotErrorAll(
    [accountAddress, client],
    ([addr, redis]) =>
      redis.ft
        .search(
          AssetIndex.Asset,
          `@${ASSET_SCHEMA['$.owner'].AS}:{${addr}}${options.type ? ` @${ASSET_SCHEMA['$.type'].AS}:{${options.type}}` : ''}`,
          {
            LIMIT: {
              size: options.size,
              from: options.from,
            },
            SORTBY: { BY: ASSET_SCHEMA['$.n_block'].AS, DIRECTION: 'DESC' },
          },
        )
        .then((res) =>
          res.total && res.documents.length
            ? res.documents.map((doc) => doc.value as AssetDocument)
            : [],
        )
        .catch((err: Error) => err),
  )

  const passportItems = await whenNotErrorAll(
    [accountAddress, passportItemAssets, client],
    ([, assets, redis]) =>
      Promise.all(
        assets.map((asset) =>
          redis.json
            .get(generatePassportItemKey(asset.payload ?? ''))
            .then((res) => res as PassportItemDocument)
            .then((doc) => ({
              ...asset,
              ...doc,
              assetId: asset.id,
              passportDocId: doc.id,
              id: `${asset.id}-${doc.id}`,
            }))
            .catch(() => null),
        ),
      ),
  )

  await whenNotError(client, (redis) => redis.quit())

  const res = whenNotError(passportItems, (items) => {
    const validItems = items.filter((item) => !!item)
    return {
      data: validItems,
      total: validItems.length,
      last: options.from + options.size - 1,
    }
  })

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
