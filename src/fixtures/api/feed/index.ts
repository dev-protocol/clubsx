import {
  whenNotError,
  whenNotErrorAll,
  type ErrorOr,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import {
  getPassportItemFromPayload,
  sTokenPayload as sTokenPayloadSchema,
  type PassportItemAssetType,
} from '@devprotocol/clubs-plugin-passports'
import { ACHIEVEMENT_ITEM_SCHEMA } from '@plugins/achievements/db/schema'
import {
  type AchievementItem,
  type AchievementInfo,
} from '@plugins/achievements/types'
import {
  generateKey,
  AchievementPrefix,
  AchievementIndex,
} from '@plugins/achievements/utils'
import { Index as AssetIndex } from '@fixtures/api/assets/redis'
import type { AssetDocument } from '../assets/schema'
import {
  type as assetTypeSchema,
  owner,
  nBlock as assetNBlockSchema,
  payload as assetPayloadSchema,
} from '../assets/schema'
import { getProfile } from '../profile'
import type { Clip, Profile, Skin } from '@pages/api/profile'
import { getClubByProperty } from '../club/redis'
import { bytes32Hex, decode } from '@devprotocol/clubs-core'
import { defaultConfig, encodedDefaultConfig } from '@constants/defaultConfig'
import {
  config as uniqueNameGeneratorConfig,
  getBoringAvatar,
} from '../profile/utils'
import { itemToHash, type ClipTypes } from '@fixtures/router/passportItem'
import { generateProfileId } from '../keys'
import type { AsyncReturnType } from 'type-fest'
import { uniqueNamesGenerator } from 'unique-names-generator'
import { nanoid } from 'nanoid'
import { Redis } from '@devprotocol/clubs-core/redis'
import { orderBy } from 'lodash-es'

export type ProfileWithId = Profile & { id: string }
export type FeedUserData = {
  name: string
  address: string
  avatarSrc: string
}

export type FeedType = {
  id: string
  avatarSrc: string
  badgeSrc: string
  assetSrc: string
  name: string
  address: string
  badgeName: string
  description?: string
  frameHexColor?: string
  tag: PassportItemAssetType | 'ugc'
  item: Clip
  clipType: ClipTypes
  parentPassport: Skin
  parentPassportIndex: number
  score: number
  updateTime: number
  engagementScore: number
  clubLink?: string
}

export const getAllProfiles = async (
  redis: Awaited<ReturnType<(typeof Redis)['client']>>,
): Promise<ErrorOr<Array<UndefinedOr<ProfileWithId>>>> => {
  const keys = await whenNotError(redis, (client) => {
    try {
      return client.keys(generateProfileId('*'))
    } catch {
      return [] as string[]
    }
  })

  return await whenNotErrorAll([redis, keys], ([client, _keys]) => {
    if (!_keys.length) {
      return [] as undefined[]
    }

    return Promise.all(
      _keys.map(async (key) => {
        const profile = await client.get(key).catch(() => undefined)
        if (!profile) {
          return undefined
        }

        try {
          return {
            ...JSON.parse(profile),
            id: key.replaceAll('profile::', ''),
          } as ProfileWithId
        } catch (err) {
          return undefined
        }
      }),
    )
  })
}

export const getClubFromAssetPayload = async (
  payload: string,
  redis: Awaited<ReturnType<(typeof Redis)['client']>>,
) => {
  if (!payload || !redis || redis instanceof Error) {
    return undefined
  }

  const assetDocument = await redis.ft
    .search(
      AssetIndex.Asset,
      `@${assetPayloadSchema['$.payload'].AS}:{${payload}}`,
      {
        LIMIT: { from: 0, size: 1 },
      },
    )
    .then((res) => {
      return res.total && res.documents.length
        ? (res.documents.at(0)?.value as AssetDocument) || undefined
        : undefined
    })
    .catch(() => undefined)
  if (!assetDocument || !assetDocument?.propertyAddress) {
    return undefined
  }

  const clubDocument = await getClubByProperty(
    assetDocument.propertyAddress,
    redis,
  )
    .then((clubDocument) => clubDocument)
    .catch(() => undefined)
  if (!clubDocument || !clubDocument?.clubsUrl) {
    return undefined
  }

  const clubsSubDomain = new URL(clubDocument.clubsUrl).hostname
    .split('.')
    .at(0)
  if (!clubsSubDomain) {
    return undefined
  }

  return await redis
    .get(clubsSubDomain)
    .then((res: string | null) => (res ? decode(res) : undefined))
    .catch(() => undefined)
}

export const getFeedAssetFromClip = async (
  clip: Clip,
  skin: Skin,
  skinIndex: number,
  type: ClipTypes,
  ownerDetails: FeedUserData,
  redis: Awaited<ReturnType<(typeof Redis)['client']>>,
  currentTime: number,
): Promise<FeedType | undefined> => {
  if (
    !clip ||
    clip instanceof Error ||
    !ownerDetails ||
    ownerDetails instanceof Error ||
    !redis ||
    redis instanceof Error
  ) {
    return undefined
  }
  if (!clip.link && !clip.payload) {
    return undefined
  }

  let clubName: string = ''
  let clubAvatar: string = ''
  let itemAssetValue: string = ''
  let itemAssetType: PassportItemAssetType | 'ugc'
  let clubLink: UndefinedOr<string> = undefined

  if (clip.link && !clip.payload) {
    clubName = ''
    clubAvatar = ''
    itemAssetType = 'ugc'
    itemAssetValue = clip.link
  } else {
    const passportItem = await getPassportItemFromPayload({
      sTokenPayload: clip.payload || '',
    })
      .then((passportItemDocument) =>
        passportItemDocument instanceof Error
          ? undefined
          : passportItemDocument,
      )
      .catch(() => undefined)
    if (!passportItem || !passportItem?.sTokenPayload) {
      return undefined
    }
    itemAssetType = passportItem.itemAssetType
    itemAssetValue = passportItem.itemAssetValue

    const clubConfig = await getClubFromAssetPayload(
      passportItem.sTokenPayload,
      redis,
    )
    clubName = clubConfig?.name || ''
    clubAvatar = (clubConfig?.options?.find(
      (option) => option.key === 'avatarImgSrc',
    )?.value || 'https://i.imgur.com/lSpDjrr.jpg') as string
    clubLink = clubConfig?.url
  }

  const contentTimestamp =
    (clip.updatedAt > clip.createdAt ? clip.updatedAt : clip.createdAt) || 0
  const engagementScore = skin.likes || 0
  const recencyScore = Math.exp(-(currentTime - contentTimestamp) / 86400)
  const finalScore = 0.6 * recencyScore + 0.4 * engagementScore // 60% importance to recency, 40% to engagement.

  return {
    id: clip.id || nanoid(),
    avatarSrc: ownerDetails.avatarSrc,
    badgeSrc: clubAvatar,
    assetSrc: itemAssetValue,
    tag: itemAssetType,
    name: ownerDetails.name,
    address: ownerDetails.address,
    badgeName: clubName,
    description: clip.description || '',
    frameHexColor: clip.frameColorHex || '',
    item: clip,
    clipType: type,
    parentPassport: skin,
    parentPassportIndex: skinIndex,
    score: finalScore || 0,
    updateTime: contentTimestamp || 0,
    engagementScore: engagementScore || 0, // only based on likes for now.
    clubLink,
  }
}

export const getClipFromSkin = async (
  skin: Skin,
  skinIndex: number,
  ownerDetails: FeedUserData,
  redis: Awaited<ReturnType<(typeof Redis)['client']>>,
  currentTime: number,
) => {
  if (
    !skin ||
    skin instanceof Error ||
    !ownerDetails ||
    ownerDetails instanceof Error ||
    !redis ||
    redis instanceof Error
  ) {
    return []
  }

  const clips = skin.clips || []
  const spotlight = skin.spotlight || []
  const clipsFeedDataPromises = Promise.all(
    clips.map(async (clip) => {
      return getFeedAssetFromClip(
        clip,
        skin,
        skinIndex,
        'clips',
        ownerDetails,
        redis,
        currentTime,
      )
    }),
  )
  const spotlightsFeedDataPromises = Promise.all(
    spotlight.map(async (clip) => {
      return getFeedAssetFromClip(
        clip,
        skin,
        skinIndex,
        'spotlight',
        ownerDetails,
        redis,
        currentTime,
      )
    }),
  )

  const [clipsFeedData, spotlightFeedData] = await Promise.all([
    clipsFeedDataPromises,
    spotlightsFeedDataPromises,
  ])
  return [...clipsFeedData, ...spotlightFeedData]
}

export const getFeed = async (tag: string = 'recent') => {
  const redis = await Redis.client().catch((err) => new Error(err))

  const profiles = await whenNotError(redis, (client) => getAllProfiles(client))
  const currentTime = Date.now()
  let feed: Array<FeedType> = []
  try {
    const nestedFeed = await whenNotErrorAll(
      [redis, profiles],
      ([client, _profiles]) => {
        return Promise.all(
          _profiles?.map(async (profile) => {
            if (!profile) {
              return []
            }

            const ownerDetails: FeedUserData = {
              avatarSrc:
                profile?.avatar ||
                (await getBoringAvatar('0x...')
                  .then((res) => res)
                  .catch(() => 'https://i.imgur.com/lSpDjrr.jpg')),
              name:
                profile?.username ||
                uniqueNamesGenerator({
                  ...uniqueNameGeneratorConfig,
                  seed: profile?.id || '0x..',
                }) ||
                '0x..',
              address: profile?.id || '0x...',
            }

            return await Promise.all(
              profile?.skins?.map(async (skin, i) => {
                const clip = await getClipFromSkin(
                  skin,
                  i,
                  ownerDetails,
                  client,
                  currentTime,
                )
                return clip
              }) ?? [],
            )
          }) ?? [],
        )
      },
    )
    feed = (
      nestedFeed instanceof Error
        ? []
        : nestedFeed.flat(Infinity).filter((feed) => !!feed)
    ) as Array<FeedType>
  } catch (err) {
    console.log('Err', err)
  }

  const filteredFeed =
    (tag.toLowerCase() === 'score'
      ? orderBy(feed, ['score'], ['desc'])
      : tag.toLowerCase() === 'random3'
        ? getRandomElements(feed || [], 3)
        : tag.toLowerCase() === 'random6'
          ? getRandomElements(feed || [], 6)
          : orderBy(feed, ['updateTime'], ['desc'])) || []

  return filteredFeed
}

function getRandomElements(feed: Array<FeedType>, noOfItems: number) {
  const result = []
  const seen = new Set()

  while (result.length < noOfItems) {
    const randomIndex = Math.floor(Math.random() * feed.length)
    if (!seen.has(randomIndex)) {
      result.push(feed[randomIndex])
      seen.add(randomIndex)
    }
  }

  return result
}

export const getSBTsForEOAFromClubsUrlHash = async (
  clubsUrlHash: string,
  clubsUrl: string,
  eoa: string,
) => {
  const client = await Redis.client()
  const getMetaData = async (
    achievementInfoId: string,
  ): Promise<AchievementInfo> => {
    const achievementInfoDocument = (await whenNotErrorAll(
      [achievementInfoId, client],
      ([infoId, _client]) =>
        _client.json
          .get(generateKey(AchievementPrefix.AchievementInfo, infoId))
          .catch((err: Error) => err),
    )) as AchievementInfo
    return achievementInfoDocument
  }

  const data: AchievementItem[] = await whenNotErrorAll(
    [clubsUrlHash, eoa],
    ([hash, addr]) =>
      client.ft
        .search(
          AchievementIndex.AchievementItem,
          `@${ACHIEVEMENT_ITEM_SCHEMA['$.clubsUrl'].AS}:{${hash}}@${ACHIEVEMENT_ITEM_SCHEMA['$.account'].AS}:{${addr}}`,
          {
            SORTBY: {
              BY: ACHIEVEMENT_ITEM_SCHEMA['$.claimedOnTimestamp'].AS,
              DIRECTION: 'DESC',
            },
          },
        )
        .then((res) => {
          return JSON.parse(
            JSON.stringify(res.documents.map(({ value }) => value)),
          )
        })
        .catch((err: Error) => err),
  )
  const arrangeData = async (data: AchievementItem) => {
    const achievementInfo = await getMetaData(data.achievementInfoId)
    return {
      name: achievementInfo.metadata.name,
      url: `${clubsUrl}/achievement/${data.achievementDistId}`,
      image: achievementInfo.metadata.image,
    }
  }
  const finalData = await Promise.all(
    data.map(async (item) => {
      return await arrangeData(item)
    }),
  )
  return finalData
}
