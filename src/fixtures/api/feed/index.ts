import {
  whenDefined,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { always } from 'ramda'
import { createClient } from 'redis'
import {
  getPassportItemFromPayload,
  Index,
  sTokenPayload,
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
import { type as assetTypeSchema, owner } from '../assets/schema'
import { getProfile } from '../profile'
import type { Clip, Profile, Skin } from '@pages/api/profile'
import { getClubByProperty } from '../club/redis'
import { bytes32Hex, decode } from '@devprotocol/clubs-core'
import { defaultConfig, encodedDefaultConfig } from '@constants/defaultConfig'
import { getBoringAvatar } from '../profile/utils'
import { itemToHash, type ClipTypes } from '@fixtures/router/passportItem'

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
          const [userProfile, clubDocument, passportItemDocument] =
            await Promise.all([
              getProfile({ id: asset.owner })
                .then((profile) => profile as Profile)
                .catch(() => undefined),
              getClubByProperty(
                asset.propertyAddress ||
                  '0xF5fb43b4674Cc8D07FB45e53Dc77B651e17dC407', // Use developers clubs default property address if absent in AssetDocument.
                client,
              )
                .then((clubDocument) => clubDocument)
                .catch(() => undefined),
              getPassportItemFromPayload({ sTokenPayload: asset.payload || '' })
                .then((passportItemDocument) =>
                  passportItemDocument instanceof Error
                    ? undefined
                    : passportItemDocument,
                )
                .catch(() => undefined),
            ])

          const clubConfiguration = decode(
            await client
              .get(
                // Get clubs key.
                new URL(clubDocument?.clubsUrl || '').hostname
                  .split('.')
                  .at(0) || 'developers',
              )
              .then((club) => club || encodedDefaultConfig) // Use default config if absent.
              .catch(() => encodedDefaultConfig), // Use default config if absent.
          )

          let skinSection: ClipTypes | undefined
          let skinFoundFirst: Skin | undefined
          let clipFoundFirst: Clip | undefined
          for (const skin of userProfile?.skins || []) {
            const spotlightItem = skin.spotlight?.find(
              (clip) =>
                (clip.sTokenId === asset.id || asset.nId?.toString()) &&
                clip.payload === asset.payload,
            )
            if (spotlightItem) {
              skinFoundFirst = skin
              skinSection = 'spotlight'
              clipFoundFirst = spotlightItem
              break
            }

            const showcaseItme = skin.clips?.find(
              (clip) =>
                (clip.sTokenId === asset.id || asset.nId?.toString()) &&
                clip.payload === asset.payload,
            )

            if (showcaseItme) {
              skinFoundFirst = skin
              skinSection = 'clips'
              clipFoundFirst = spotlightItem
              break
            }
          }

          return {
            clubDetails: {
              url: clubConfiguration?.url || 'https://developers.clubs.place', // Use developers club if absent.
              name: clubConfiguration?.name || 'Developers', // Use developers club if absent.
              avatar:
                clubConfiguration?.options?.find(
                  (option) => option.key === 'avatarImgSrc',
                )?.value || 'https://i.imgur.com/lSpDjrr.jpg', // Use clubs default avatar if absent in AssetDocument.
            },
            ownerDetails: {
              address: asset.owner,
              avatar:
                userProfile?.avatar ||
                (await getBoringAvatar('0x...')
                  .then((res) => res)
                  .catch(() => 'https://i.imgur.com/lSpDjrr.jpg')), // Use boring or clubs default avatar if absent.
              username: userProfile?.username || '0x...',
            },
            passportDetails: {
              id: asset.id || asset.nId?.toString(),
              sTokenPayload:
                asset.payload || passportItemDocument?.sTokenPayload,
              itemAssetType: passportItemDocument?.itemAssetType,
              itemAssetValue: passportItemDocument?.itemAssetValue,
              itemLink: `/passport/${asset.owner}/${skinFoundFirst?.id || ''}/${itemToHash(skinSection || 'clips', clipFoundFirst?.sTokenId || '') || ''}`,
              itemDescription: clipFoundFirst?.description || '',
              itemFrameColorHex: clipFoundFirst?.frameColorHex || '',
              itemPreviewImgSrc:
                clubConfiguration?.offerings?.find(
                  (offering) => bytes32Hex(offering.payload) === asset.payload,
                )?.imageSrc || 'https://i.imgur.com/lSpDjrr.jpg', // Use clubs default avatar if absent.
            },
          }
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
