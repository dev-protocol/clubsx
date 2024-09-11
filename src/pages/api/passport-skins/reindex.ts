import { headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import {
  getDefaultClient,
  Index,
  Prefix,
  SchemaKey,
} from '@fixtures/api/passport-skins/redis'
import { json } from '@fixtures/api/json'
import {
  PASSPORTSKIN_SCHEMA,
  PASSPORTSKIN_SCHEMA_ID,
} from '@fixtures/api/passport-skins/schema'
import { whenDefined } from '@devprotocol/util-ts'

export const GET: APIRoute = async () => {
  const client = await getDefaultClient()

  const [PassportSkinScm] = await Promise.all([
    client.get(SchemaKey.PassportSkin),
  ])

  const index = PassportSkinScm === PASSPORTSKIN_SCHEMA_ID ? true : undefined

  console.log({ PassportSkinScm, index })

  await whenDefined(index ? undefined : true, () =>
    Promise.all([
      PassportSkinScm === PASSPORTSKIN_SCHEMA_ID
        ? Promise.resolve()
        : client.ft
            .dropIndex(Index.PassportSkin)
            .catch(() => null)
            .then(() =>
              client.ft
                .create(Index.PassportSkin, PASSPORTSKIN_SCHEMA, {
                  ON: 'JSON',
                  PREFIX: Prefix.PassportSkin,
                })
                .then(() =>
                  client.set(SchemaKey.PassportSkin, PASSPORTSKIN_SCHEMA_ID),
                )
                .then(() => console.log('###')),
            ),
    ]),
  )

  await client.quit()

  return new Response(
    json({
      status: whenDefined(
        index,
        () => 'Passport skin index is up to date' ?? 'Passport skin re-indexed',
      ),
    }),
    {
      status: 200,
      headers,
    },
  )
}
