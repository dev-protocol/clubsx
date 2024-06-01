import { headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'
import { JsonRpcProvider } from 'ethers'
import { getDefaultClient } from '@fixtures/api/assets/redis'
import { addresses } from '@devprotocol/dev-kit'
import { json } from '@fixtures/api/json'
import { fetchAssets } from '@fixtures/api/assets/utils'
import { AchievementIndex } from '@plugins/achievements/utils'
import PQueue from 'p-queue'

const { PUBLIC_INFURA_KEY } = import.meta.env

const queue = new PQueue({ concurrency: 5 })

export const maxDuration = 30

/**
 * CRON job to fetch all assets and record them in the database
 * @returns
 */
export const GET: APIRoute = async () => {
  const rpcProvider =
    whenDefined(
      PUBLIC_INFURA_KEY,
      (key) =>
        new JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${key}`),
    ) ?? new Error('INFURA key not found')

  const redis = await getDefaultClient()

  const sTokensAssets = await whenNotError(rpcProvider, (provider) =>
    fetchAssets({
      provider,
      redis,
      contractAddress: addresses.polygon.mainnet.sTokens,
      type: 'nft',
    }),
  )

  const sbts = await redis.ft.tagVals(
    AchievementIndex.AchievementInfo,
    'contract',
  )
  console.log({ sbts })

  const sbtAssets = await whenNotError(rpcProvider, (provider) =>
    queue.addAll(
      sbts.map(
        (sbt) => () =>
          fetchAssets({
            provider,
            redis,
            contractAddress: sbt,
            type: 'sbt',
          }),
      ),
    ),
  )
  console.log({ sbtAssets })

  await redis.quit()

  const res = [
    ...(isNotError(sTokensAssets) ? sTokensAssets : []),
    ...(isNotError(sbtAssets) ? sbtAssets.filter(isNotError) : []).flat(),
  ]

  return new Response(json(res), {
    status: 200,
    headers,
  })
}
