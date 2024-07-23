import { cache, headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import {
  isNotError,
  whenDefined,
  type ErrorOr,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { JsonRpcProvider } from 'ethers'
import PQueue from 'p-queue'
import {
  getClubByProperty,
  getDefaultClient,
  withCheckingIndex as withCheckingIndexClubs,
} from '@fixtures/api/club/redis'
import {
  uuidToQuery,
  AchievementIndex,
  AchievementPrefix,
} from '@plugins/achievements/utils'
import {
  ACHIEVEMENT_INFO_SCHEMA,
  ACHIEVEMENT_ITEM_SCHEMA,
} from '@plugins/achievements/db/schema'
import {
  getMetadata,
  type Metadata,
  getAllOwnedTokens,
} from '@plugins/tickets/utils/nft'
import { clientsSTokens } from '@devprotocol/dev-kit'
import { json } from '@fixtures/api/json'
import type { AsyncReturnType } from 'type-fest'
import { withCheckingIndex } from '@plugins/achievements/db/redis'
import type {
  AchievementInfo,
  AchievementItem,
} from '@plugins/achievements/types'

const { PUBLIC_ALCHEMY_KEY } = import.meta.env

const onChainQueue = new PQueue({ concurrency: 3 })

const createFetchAllNFTs =
  (account: string, provider: JsonRpcProvider) => async (contract: string) =>
    getAllOwnedTokens(contract, account, provider)

const createFetchAllAchievementInfo =
  (
    provider: JsonRpcProvider,
    redis: AsyncReturnType<typeof getDefaultClient>,
  ) =>
  async (
    achievementItem: AchievementItem,
  ): Promise<{ contract: string; id: number; metadata: ErrorOr<Metadata> }> => {
    const info = await redis.json
      .get(
        `${AchievementPrefix.AchievementInfo}::${achievementItem.achievementInfoId}`,
      )
      .then((res) => res as AchievementInfo)
    const metadata = await getMetadata(
      info.contract,
      achievementItem.claimedSBTTokenId,
      provider,
    )
    return {
      contract: info.contract,
      id: Number(info.id),
      metadata,
    }
  }

export type AssetItem = {
  propertyAddress: string
  name: string
  description: string
  image: string
}

export type AssetsResponse = {
  achievements: AssetItem[]
  memberships: AssetItem[]
}

const fetchAllMemberships = async ({
  id,
  provider,
}: {
  id: string
  provider: JsonRpcProvider
}) => {
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

  const mapAllMemberships = whenNotErrorAll(
    [allMemberships, allPositions],
    ([memberships, positions]) =>
      memberships.map(
        (membership, i): AssetItem => ({
          ...membership,
          propertyAddress: positions[i].property,
        }),
      ),
  )

  return mapAllMemberships
}

const fetchAllAchiements = async ({
  id,
  provider,
  client,
}: {
  id: string
  provider: JsonRpcProvider
  client: AsyncReturnType<typeof getDefaultClient>
}) => {
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
      onChainQueue
        .addAll(achievements.map((addr) => () => allNFTOf(addr)))
        .then((all) => all.flat()),
  )

  const mapAllAchivements = whenNotError(allAchivements, (achievements) =>
    achievements
      .filter(
        (item) =>
          isNotError(item.metadata) &&
          item.metadata.attributes.some(
            ({ trait_type }) => trait_type === 'Property',
          ),
      )
      .map(
        (item): AssetItem => ({
          ...(item.metadata as Metadata),
          propertyAddress:
            (item.metadata as Metadata).attributes.find(
              ({ trait_type }) => trait_type === 'Property',
            )?.value ?? (undefined as never),
        }),
      ),
  )

  return mapAllAchivements
}

const fetchAllAchiementsForAddress = async ({
  id,
  provider,
  client,
}: {
  id: string
  provider: JsonRpcProvider
  client: AsyncReturnType<typeof getDefaultClient>
}) => {
  const fetchAchievementInfo = whenNotErrorAll(
    [client, provider],
    ([_client, _provider]) => createFetchAllAchievementInfo(_provider, _client),
  )

  const allAchievementItems = await whenNotError(client, (redis) =>
    redis.ft
      .search(
        AchievementIndex.AchievementItem,
        `@${ACHIEVEMENT_ITEM_SCHEMA['$.account'].AS}:{${uuidToQuery(id)}}`,
      )
      .then(
        (allAchievementItemDocuments) => allAchievementItemDocuments.documents,
      )
      .catch((err: Error) => err),
  )

  const allAchivements = await whenNotErrorAll(
    [allAchievementItems, fetchAchievementInfo],
    ([achievements, fetchInfo]) =>
      onChainQueue
        .addAll(
          achievements
            .filter(
              (achievement) =>
                (achievement.value as unknown as AchievementItem)
                  .claimedSBTTokenId > 0,
            )
            .map(
              (achievement) => () =>
                fetchInfo(achievement.value as unknown as AchievementItem),
            ),
        )
        .then((all) => all.flat()),
  )

  const mapAllAchivements = whenNotError(allAchivements, (achievements) =>
    achievements
      .filter(
        (item) =>
          isNotError(item.metadata) &&
          item.metadata.attributes.some(
            ({ trait_type }) => trait_type === 'Property',
          ),
      )
      .map(
        (item): AssetItem => ({
          ...(item.metadata as Metadata),
          propertyAddress:
            (item.metadata as Metadata).attributes.find(
              ({ trait_type }) => trait_type === 'Property',
            )?.value ?? (undefined as never),
        }),
      ),
  )

  return mapAllAchivements
}

export const GET: APIRoute = async ({
  params,
}: {
  params: { id?: string }
}) => {
  const id =
    whenDefined(params.id, (_id) => _id) ?? new Error('No profile ID passed')

  const provider =
    whenDefined(
      PUBLIC_ALCHEMY_KEY,
      (key) =>
        new JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${key}`),
    ) ?? new Error('INFURA key not found')

  const client = await withCheckingIndexClubs(() =>
    withCheckingIndex(getDefaultClient),
  )

  const allData = await whenNotErrorAll(
    [id, provider, client],
    ([_id, _provider, _client]) =>
      Promise.all([
        fetchAllMemberships({ id: _id, provider: _provider }),
        fetchAllAchiementsForAddress({
          id: _id,
          provider: _provider,
          client: _client,
        }),
      ]),
  )

  const [allMemberships, allAchievements] = isNotError(allData)
    ? [allData[0], allData[1]]
    : [
        new Error('Failed to fetch all memberships'),
        new Error('Failed to fetch all achievements'),
      ]

  const [allClubsMemberships, allClubsAchievements] = await Promise.all([
    whenNotErrorAll([allMemberships, client], async ([memberships, redis]) => {
      const bits = await Promise.all(
        memberships.map((mem) => getClubByProperty(mem.propertyAddress, redis)),
      )
      return memberships.filter((_, i) => bits[i] !== undefined)
    }),
    whenNotErrorAll(
      [allAchievements, client],
      async ([achievements, redis]) => {
        const bits = await Promise.all(
          achievements.map((ach) =>
            getClubByProperty(ach.propertyAddress, redis),
          ),
        )
        return achievements.filter((_, i) => bits[i] !== undefined)
      },
    ),
  ])

  const assets: AssetsResponse = {
    achievements: isNotError(allClubsAchievements) ? allClubsAchievements : [],
    memberships: isNotError(allClubsMemberships) ? allClubsMemberships : [],
  }

  await client.quit()

  return new Response(json(assets), {
    status: 200,
    headers: { ...headers, ...cache({ maxAge: 60 * 15 /* == 15 minutes */ }) },
  })
}
