import { decode } from '@devprotocol/clubs-core'
import { headers } from '@fixtures/api/headers'
import { verifiedAccount } from '@fixtures/api/superuser'
import {
  addPassportItemSetter,
  type CreatePassportItemReq,
} from '@devprotocol/clubs-plugin-passports'
import {
  isNotError,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { getDefaultClient } from '@plugins/achievements/db/redis'

export const POST = async ({ request }: { request: Request }) => {
  const reqBody = (await request
    .json()
    .catch((err: Error) => err)) as CreatePassportItemReq & {
    site: string
  }
  const props =
    whenDefinedAll(
      [reqBody.site, reqBody.message, reqBody.signature, reqBody.passportItem],
      ([site, message, signature, passportItem]) => ({
        site,
        message,
        signature,
        passportItem,
      }),
    ) ?? new Error('#PROPS')

  const authrized = whenNotError(props, ({ message, signature }) =>
    verifiedAccount({ message, signature }),
  )

  const client = await getDefaultClient().catch((err: Error) => err)

  const conf = await whenNotErrorAll([client, props], ([redis, { site }]) =>
    redis.get(site),
  )

  const decodedConf = whenNotError(conf, (config) =>
    config ? decode(config) : new Error('#CONF'),
  )

  const res = await whenNotErrorAll(
    [props, client, decodedConf, authrized],
    ([data, redis, { url }]) =>
      addPassportItemSetter({ client: redis, data, url }),
  )

  await whenNotError(client, (redis) => redis.quit())

  return new Response(
    isNotError(res)
      ? JSON.stringify({ res })
      : JSON.stringify({ error: res.message }),
    {
      status: isNotError(res) ? 200 : 400,
      headers,
    },
  )
}
