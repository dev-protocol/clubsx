import { headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'
import { Contract, decodeBase64, JsonRpcProvider, toUtf8String } from 'ethers'
import { getDefaultClient } from '@fixtures/api/assets/redis'
import { addresses, arrayify } from '@devprotocol/dev-kit'
import { json } from '@fixtures/api/json'
import { ABI_NFT, fetchAssets } from '@fixtures/api/assets/utils'
import { AchievementIndex } from '@plugins/achievements/utils'
import PQueue from 'p-queue'
import { tryCatch } from 'ramda'

const { PUBLIC_INFURA_KEY } = import.meta.env

const queue = new PQueue({ concurrency: 5 })

export const maxDuration = 30

const sTokensPropertyAddressFetcher = async (
  contract: Contract,
  id: string,
) => {
  const pos = await queue.add(() => contract.positions(id))
  return arrayify(pos)[0] as string
}
const SBTPropertyAddressFetcher = async (contract: Contract, id: string) => {
  const uri = await queue.add(() => contract.tokenURI(id))
  const decoded = toUtf8String(
    decodeBase64(
      uri
        .replace(
          /^data(\s+)?:(\s+)?application(\s+)?\/(\s+)?json(\s+)?;(\s+)?base64(\s+)?,(.*)/,
          '$8',
        )
        .trim(),
    ),
  )
  const metadata = tryCatch(
    (m: string) => JSON.parse(m),
    (err) => {
      console.error(err)
      return {}
    },
  )(decoded)
  return (
    metadata?.attributes.find((elm: any) => elm?.trait_type === 'Property')
      ?.value ?? undefined
  )
}

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

  const sTokensAbi = [
    ...ABI_NFT,
    'function positions(uint256) view returns (tuple(address property, uint256 amount, uint256 price, uint256 cumulativeReward, uint256 pendingReward))',
  ]
  const sTokensAssets = await whenNotError(rpcProvider, (provider) =>
    fetchAssets({
      provider,
      redis,
      contractAddress: addresses.polygon.mainnet.sTokens,
      abi: sTokensAbi,
      type: 'nft',
      propertyAddressFetcher: sTokensPropertyAddressFetcher,
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
            abi: ABI_NFT,
            type: 'sbt',
            propertyAddressFetcher: SBTPropertyAddressFetcher,
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
