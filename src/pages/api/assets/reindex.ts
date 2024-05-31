import { headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import {
  getDefaultClient,
  Index,
  Prefix,
  SchemaKey,
} from '@fixtures/api/assets/redis'
import { json } from '@fixtures/api/json'
import {
  ASSET_SCHEMA,
  LOG_SCHEMA,
  ASSET_SCHEMA_ID,
  LOG_SCHEMA_ID,
} from '@fixtures/api/assets/schema'
import { whenDefined } from '@devprotocol/util-ts'

export const GET: APIRoute = async () => {
  const client = await getDefaultClient()

  const [AssetScm, LogScm] = await Promise.all([
    client.get(SchemaKey.Asset),
    client.get(SchemaKey.Log),
  ])

  const index =
    AssetScm === ASSET_SCHEMA_ID && LogScm === LOG_SCHEMA_ID ? true : undefined

  await whenDefined(index, () =>
    Promise.all([
      client.ft.dropIndex(Index.Asset).catch(() => null),
      client.ft.dropIndex(Index.Log).catch(() => null),
    ]).then(() =>
      Promise.all([
        client.ft.create(Index.Asset, ASSET_SCHEMA, {
          ON: 'JSON',
          PREFIX: Prefix.Asset,
        }),
        client.ft.create(Index.Log, LOG_SCHEMA, {
          ON: 'JSON',
          PREFIX: Prefix.Log,
        }),
      ]),
    ),
  )

  await whenDefined(index, () =>
    Promise.all([
      client.set(SchemaKey.Asset, ASSET_SCHEMA_ID),
      client.set(SchemaKey.Log, LOG_SCHEMA_ID),
    ]),
  )

  await client.quit()

  return new Response(
    json({
      status: whenDefined(index, () => 'index is up to date' ?? 're-indexed'),
    }),
    {
      status: 200,
      headers,
    },
  )
}
