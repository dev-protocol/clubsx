import { headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import {
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { JsonRpcProvider } from 'ethers'
import PQueue from 'p-queue'
import { getDefaultClient } from '@fixtures/api/club/redis'
import { AchievementIndex } from '@plugins/achievements/utils'
import { ACHIEVEMENT_INFO_SCHEMA } from '@plugins/achievements/db/schema'
import { getAllOwnedTokens } from '@plugins/tickets/utils/nft'
import { clientsSTokens } from '@devprotocol/dev-kit'

const { PUBLIC_INFURA_KEY } = import.meta.env

const onChainQueue = new PQueue({ concurrency: 3 })

const createFetchAllNFTs =
  (account: string, provider: JsonRpcProvider) => async (contract: string) =>
    getAllOwnedTokens(contract, account, provider)

export const GET: APIRoute = async ({
  params,
}: {
  params: { id?: string }
}) => {
  const id =
    whenDefined(params.id, (_id) => _id) ?? new Error('No profile ID passed')

  const provider =
    whenDefined(
      PUBLIC_INFURA_KEY,
      (key) =>
        new JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${key}`),
    ) ?? new Error('INFURA key not found')

  const client = await getDefaultClient()

  const fetchAllNFTs = whenNotErrorAll([id, provider], ([_id, _provider]) =>
    createFetchAllNFTs(_id, _provider),
  )

  const allAchivementContracts = await whenNotError(client, (redis) =>
    redis.ft
      .tagVals(
        AchievementIndex.AchievementInfo,
        ACHIEVEMENT_INFO_SCHEMA['$.contract'].AS,
      )
      .catch((err: Error) => err),
  )

  const allAchivements = await whenNotErrorAll(
    [allAchivementContracts, fetchAllNFTs],
    ([achievements, allNFTOf]) =>
      onChainQueue.addAll(achievements.map((addr) => () => allNFTOf(addr))),
  )

  const sTokens = await whenNotError(
    provider,
    async (prov) =>
      whenDefined(
        await clientsSTokens(prov),
        ([l1, l2]) => l1 ?? l2 ?? new Error('No STokens found on the chain'),
      ) ?? new Error('Faild to create STokens Contract'),
  )

  const allSTokenIDs = await whenNotErrorAll([sTokens, id], ([client, user]) =>
    client.positionsOfOwner(user),
  )

  const allMemberships = await whenNotErrorAll(
    [allSTokenIDs, sTokens],
    ([tokens, client]) =>
      onChainQueue.addAll(tokens.map((token) => () => client.tokenURI(token))),
  )

  const allPositions = await whenNotErrorAll(
    [allSTokenIDs, sTokens],
    ([tokens, client]) =>
      onChainQueue.addAll(tokens.map((token) => () => client.positions(token))),
  )

  await client.quit()

  return new Response(null, {
    status: 200,
    headers,
  })
}
