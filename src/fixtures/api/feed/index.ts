import {
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { always } from 'ramda'
import { createClient } from 'redis'
import {
  Index,
  sTokenPayload as sTokenPayloadSchema,
  type PassportItemDocument,
} from '@devprotocol/clubs-plugin-passports'
import { getDefaultClient } from '@fixtures/api/assets/redis'
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
import { type as assetTypeSchema } from '../assets/schema'
import { getProfile } from '../profile'
import type { Profile } from '@pages/api/profile'
import { getClubByProperty } from '../club/redis'
import { decode } from '@devprotocol/clubs-core'

const { REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD } = import.meta.env

export const getFeed = async () => {
  const redis = await whenNotError(
    createClient({
      url: REDIS_URL,
      username: REDIS_USERNAME ?? '',
      password: REDIS_PASSWORD ?? '',
    }),
    (db) =>
      db
        .connect()
        .then(always(db))
        .catch((err) => new Error(err)),
  )

  const purchasedAssets = await whenNotErrorAll([redis], ([client]) =>
    client.ft
      .search(
        AssetIndex.Asset,
        `@${assetTypeSchema['$.type'].AS}:{passportItem}`,
        {
          LIMIT: {
            from: 0,
            size: 10,
          },
        },
      )
      .then((res) =>
        res.total && res.documents.length
          ? res.documents.map((doc) => doc.value as AssetDocument)
          : new Error('No purchases found'),
      )
      .catch((err) => new Error(err)),
  )

  const purchasedAssetsWithUser = await whenNotErrorAll(
    [purchasedAssets, redis],
    ([assets, client]) =>
      Promise.all(
        assets.map(async (asset) => {
          const [user, club] = await Promise.all([
            getProfile({ id: asset.owner }),
            getClubByProperty(
              asset.propertyAddress ||
                '0xF5fb43b4674Cc8D07FB45e53Dc77B651e17dC407', // Use developers clubs default property address if absent in AssetDocument.
              client,
            ),
          ])

          const clubKey =
            new URL(club?.clubsUrl || '').hostname.split('.').at(0) ||
            'developers' // Use developers clubs default subdomain if absent in AssetDocument.
          const clubDetails = decode((await client.get(clubKey)) || '')

          return {
            ...asset,
            clubDetails: {
              url: clubDetails?.url || 'https://developers.clubs.place',
              name: clubDetails?.name || 'Developers',
              avatar:
                clubDetails?.options?.find(
                  (option) => option.key === 'avatarImgSrc',
                )?.value || 'https://i.imgur.com/lSpDjrr.jpg', // Use clubs default avatar if absent in AssetDocument.
            },
            ownerDetails: {
              avatar: user.avatar,
              address: asset.owner,
              username: user.username,
            },
          } as Pick<Profile, 'avatar' | 'username' | 'sns'> & AssetDocument
        }),
      ),
  )

  const result = await whenNotErrorAll([redis], ([client]) =>
    client
      .quit()
      .then(always(purchasedAssetsWithUser))
      .catch((err) => new Error(err)),
  )

  return result
}

export const getSBTsForEOAFromClubsUrlHash = async (
  clubsUrlHash: string,
  clubsUrl: string,
  eoa: string,
) => {
  const client = await getDefaultClient()
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
  await client.quit()
  return finalData
}
