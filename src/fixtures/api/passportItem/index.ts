import { whenNotErrorAll } from '@devprotocol/util-ts'
import {
  Index,
  sTokenPayload as sTokenPayloadSchema,
  type PassportItemDocument,
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
import { Redis } from '@devprotocol/clubs-core/redis'

export const getPassportItemForPayload = async (props: {
  sTokenPayload: string
}) => {
  const redis = await Redis.client().catch((err) => new Error(err))

  const passportItem = await whenNotErrorAll(
    [props, redis],
    ([{ sTokenPayload }, client]) =>
      client.ft
        .search(
          Index.PassportItem,
          `@${sTokenPayloadSchema['$.sTokenPayload'].AS}:{${sTokenPayload}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        )
        .then((res) =>
          res.total && res.documents.length
            ? (res.documents[0].value as PassportItemDocument)
            : undefined,
        )
        .catch((err) => new Error(err)),
  )

  const result = passportItem

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
