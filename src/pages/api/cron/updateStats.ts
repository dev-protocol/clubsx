import type { DraftOptions } from '@constants/draft'
import { decode, type ClubsConfiguration } from '@devprotocol/clubs-core'
import { clientsSTokens, type STokensContract } from '@devprotocol/dev-kit'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import { generateStatsId } from '@fixtures/api/keys'
import { JsonRpcProvider, ZeroAddress } from 'ethers'
import { always } from 'ramda'
import type { Club, ClubWithStats, Stats } from '../stats/types'
import { Redis } from '@devprotocol/clubs-core/redis'

type Redis = Awaited<ReturnType<(typeof Redis)['client']>>

const prov = new JsonRpcProvider('https://polygon.drpc.org')
const U = always(undefined)

const getClub =
  (client: Redis) =>
  async (key: string): Promise<UndefinedOr<Club>> => {
    const encodedConfig = await client.get(key).catch(U)
    return whenDefined(encodedConfig, (v) => {
      const conf = decode<ClubsConfiguration>(v)
      const draftOptions = conf.options?.find(
        ({ key }) => key === '__draft',
      ) as UndefinedOr<DraftOptions>
      const draft = draftOptions?.value.isInDraft === true
      const {
        name,
        propertyAddress,
        chainId,
        rpcUrl,
        url,
        adminRolePoints,
        twitterHandle,
        description,
      } = conf
      return {
        name,
        propertyAddress,
        chainId,
        rpcUrl,
        url,
        adminRolePoints,
        twitterHandle,
        description,
        draft,
      }
    })
  }

const isPolygon = (club: Club) => {
  return club.chainId === 137
}

const addNumMembersFactory =
  (client?: STokensContract) =>
  async (club: Club): Promise<ClubWithStats> => {
    const members =
      club.propertyAddress === ZeroAddress
        ? []
        : ((await client
            ?.positionsOfProperty(club.propertyAddress)
            .catch(always([]))) ?? [])
    return { ...club, stats: { members: members?.length ?? 0 } }
  }

const factory = async (client: Redis) => {
  const [l1, l2] = await clientsSTokens(prov)
  const sTokens = l1 ?? l2
  const getter = getClub(client)
  const addNumMembers = addNumMembersFactory(sTokens)

  return async (key: string) => {
    const club = await getter(key)
    const polygon = whenDefined(club, isPolygon)
    const data =
      polygon === true ? await whenDefined(club, addNumMembers) : undefined
    return data
  }
}

export const GET = async () => {
  const client = await Redis.client()

  const clubs = new Set<ClubWithStats>()
  const getClub = await factory(client)
  const promises = new Set<Promise<void>>()
  let uniqueCreators = 0
  let publishedClubsWithMembers = 0
  let totalNumberOfMembersInPublishedClubs = 0
  const handler = async (key: string) => {
    const res = await getClub(key)
    console.log({ key, res })
    if (!res) {
      return
    }
    clubs.add(res)
  }

  for await (const key of client.scanIterator()) {
    // keep this first than next if
    if (key.includes('id::')) {
      uniqueCreators++
    }
    if (key.includes(':')) {
      // This is not a ClubsConfiguration
      continue
    }
    console.log({ key })

    promises.add(handler(key))
  }

  await Promise.all(Array.from(promises))

  const sorted = Array.from(clubs).sort(
    (a, b) => b.stats.members - a.stats.members,
  )
  console.log('@@@', sorted)
  console.log('uniqueCreators', uniqueCreators)

  for (const club of sorted) {
    if (!club.draft) {
      publishedClubsWithMembers++
      if (club.stats.members === 0) {
        break // Exit the loop once the first club with 0 members is found
      }
      totalNumberOfMembersInPublishedClubs += club.stats.members
    }
  }

  console.log('publishedClubsWithMembers', publishedClubsWithMembers)
  console.log(
    'totalNumberOfMembersInPublishedClubs',
    totalNumberOfMembersInPublishedClubs,
  )

  const data: Stats = {
    lastUpdate: new Date().toUTCString(),
    clubs: sorted,
    uniqueCreators: uniqueCreators,
    publishedClubsWithMembers: publishedClubsWithMembers,
    unpublished: sorted.length - publishedClubsWithMembers,
    publishedClubsMembers: totalNumberOfMembersInPublishedClubs,
  }

  await client.set(generateStatsId(), JSON.stringify(data))

  return new Response(null)
}
