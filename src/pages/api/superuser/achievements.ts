import { decode } from '@devprotocol/clubs-core'
import {
  isNotError,
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import type { Achievement } from '@plugins/achievements/types'
import {
  getDefaultClient,
  withCheckingIndex,
} from '@plugins/achievements/db/redis'
import { verifiedAccount } from '@fixtures/api/superuser'
import {
  setter,
  type ReqBodyAchievement,
} from '@plugins/achievements/handlers/addAchievement'
import { headers } from '@fixtures/api/headers'

export const POST = async ({ request }: { request: Request }) => {
  const reqBody = (await request
    .json()
    .catch((err: Error) => err)) as ReqBodyAchievement & {
    site: string
  }
  const props =
    whenDefinedAll(
      [
        reqBody.site,
        reqBody.message,
        reqBody.signature,
        reqBody.noOfCopies ?? 1,
        reqBody.achievement,
      ],
      ([site, message, signature, noOfCopies, achievement]) => ({
        site,
        message,
        signature,
        noOfCopies,
        achievement,
      }),
    ) ?? new Error('#PROPS')

  const authrized = whenNotError(props, ({ message, signature }) =>
    verifiedAccount({ message, signature }),
  )

  const client = await withCheckingIndex(getDefaultClient).catch(
    (err: Error) => err,
  )

  const conf = await whenNotErrorAll([client, props], ([redis, { site }]) =>
    redis.get(site),
  )

  const decodedConf = whenNotError(conf, (config) =>
    config ? decode(config) : new Error('#CONF'),
  )

  const res = await whenNotErrorAll(
    [props, client, decodedConf, authrized],
    ([data, redis, { url }]) => setter({ client: redis, url, data }),
  )

  await whenNotError(client, (redis) => redis.quit())

  return new Response(
    isNotError(res)
      ? JSON.stringify({ ids: res })
      : JSON.stringify({ error: res.message }),
    {
      status: isNotError(res) ? 200 : 400,
      headers,
    },
  )
}
