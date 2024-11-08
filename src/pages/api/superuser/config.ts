import { decode } from '@devprotocol/clubs-core'
import {
  isNotError,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { verifiedAccount } from '@fixtures/api/superuser'
import { headers } from '@fixtures/api/headers'
import { getDefaultClient, updateClubId, withCheckingIndex } from '@fixtures/api/club/redis'
import { clubsUrlToKeccak256Tag } from '@plugins/achievements/utils'

export const POST = async ({ request }: { request: Request }) => {
  const reqBody = (await request.json().catch((err: Error) => err)) as {
    site: string
    message: string
    signature: string
    config: string
  }
  const props =
    whenDefinedAll(
      [reqBody.site, reqBody.message, reqBody.signature, reqBody.config],
      ([site, message, signature, config]) => ({
        site,
        message,
        signature,
        config,
      }),
    ) ?? new Error('#PROPS')

  const authrized = whenNotError(props, ({ message, signature }) =>
    verifiedAccount({ message, signature }),
  )

  const client =  await withCheckingIndex(getDefaultClient).catch((err: Error) => err)

  const set = await whenNotErrorAll(
    [client, props, authrized],
    ([redis, { site, config }]) => redis.set(site, config),
  )

  const res = await whenNotErrorAll(
    [client, props, set],
    ([redis, { site, config }]) =>
      updateClubId(
        {
          id: site,
          propertyAddress: decode(config).propertyAddress,
          clubsUrlHash: clubsUrlToKeccak256Tag(decode(config).url),
          clubsUrl: decode(config).url,
        },
        redis,
      ),
  )

  await whenNotError(client, (redis) => redis.quit())

  return new Response(
    isNotError(res)
      ? JSON.stringify({ result: res })
      : JSON.stringify({ error: res.message }),
    {
      status: isNotError(res) ? 200 : 400,
      headers,
    },
  )
}
