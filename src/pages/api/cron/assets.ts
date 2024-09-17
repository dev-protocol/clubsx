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
import type {
  AssetContractType,
  AssetDocument,
} from '@fixtures/api/assets/schema'
import type { createClient } from 'redis'

const { PUBLIC_ALCHEMY_KEY } = import.meta.env

const queue = new PQueue({ concurrency: 10 })

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

const assetTypeFetcher = async (
  type: AssetContractType,
  id?: string,
  contract?: Contract,
  client?: ReturnType<typeof createClient>,
): Promise<{
  assetType: AssetDocument['type']
  assetPayload: string | undefined
}> => {
  if (type === 'property') {
    return { assetType: 'property', assetPayload: undefined }
  }

  if (type === 'sbt') {
    return { assetType: 'sbt', assetPayload: undefined }
  }

  // If type is 'sTokens' but id or contrac or client is not available
  // then we consider this as nft (membership) for fallback.
  if (!id || !contract || !client) {
    return { assetType: 'nft', assetPayload: undefined } // @TODO: maybe we can add type as undefined and later on  for all undefined try fetching them again.
  }

  const sTokenPayload: string = await queue.add(() =>
    contract
      .payloadOf(id)
      .then((res) => res)
      .catch(() => ''),
  )
  // Backup value as nft (membership).
  if (!sTokenPayload) {
    return { assetType: 'nft', assetPayload: undefined } // @TODO: maybe we can add type as undefined and later on  for all undefined try fetching them again.
  }

  const PassportItemIndex = 'idx::clubs:passportitem' // @TODO: import type from @devprotocol/clubs-plugin-passport once it is published.
  const sTokenPayloadSchema = {
    // @TODO: import type from @devprotocol/clubs-plugin-passport once it is published
    '$.sTokenPayload': {
      AS: 'sTokenPayload',
    },
  }
  // Check the PassportItem schema, if document/value is present that means it's an passport-item.
  const isPassportItem: boolean = await client.ft
    .search(
      PassportItemIndex,
      `@${sTokenPayloadSchema['$.sTokenPayload'].AS}:{${sTokenPayload}}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    )
    .then((res) => !!res.total && !!res.documents.length)
    .catch((err) => false)

  return {
    assetType: isPassportItem ? 'passport-item' : 'nft',
    assetPayload: sTokenPayload,
  }
}

/**
 * CRON job to fetch all assets and record them in the database
 * @returns
 */
export const GET: APIRoute = async () => {
  const rpcProvider =
    whenDefined(
      PUBLIC_ALCHEMY_KEY,
      (key) =>
        new JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${key}`),
    ) ?? new Error('Alchemy key not found')

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
      contractType: 'sTokens',
      assetTypeFetcher,
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
            contractType: 'sbt',
            assetTypeFetcher,
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
