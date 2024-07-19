import { nanoid } from 'nanoid'
import { ZeroAddress, keccak256, toUtf8Bytes } from 'ethers'

import { encode } from '@devprotocol/clubs-core'

import type { DefaultClient } from './db/redis'
import type { AchievementDist, AchievementInfo, AchievementItem } from './types'
import { aperture } from 'ramda'
import { ACHIEVEMENT_DIST_SCHEMA, ACHIEVEMENT_ITEM_SCHEMA } from './db/schema'
import { whenDefined } from '@devprotocol/util-ts'

export enum AchievementIndex {
  AchievementInfo = 'idx::devprotocol:clubs:achievement:info',
  AchievementItem = 'idx::devprotocol:clubs:achievement:item',
  AchievementDist = 'idx::devprotocol:clubs:achievement:dist',
}

export enum AchievementPrefix {
  AchievementInfo = 'doc::devprotocol:clubs:achievement:info::',
  AchievementItem = 'doc::devprotocol:clubs:achievement:item::',
  AchievementDist = 'doc::devprotocol:clubs:achievement:dist::',
}

export enum AchievementSchemaKey {
  AchievementInfo = 'scm::devprotocol:clubs:achievement:info',
  AchievementItem = 'scm::devprotocol:clubs:achievement:item',
  AchievementDist = 'scm::devprotocol:clubs:achievement:dist',
}

/**
 * Generate a new achievement info document
 * @param base - the achievement info item without ID
 * @returns the generated new achievement info document without ID duplication check
 */
export const getAchievementInfoDocument = (
  base: Omit<AchievementInfo, 'id'>,
): AchievementInfo => ({
  ...base,
  id: keccak256(
    toUtf8Bytes(encode(base)), // Create a id based on the data passed so that it can be checked again to avoid duplication.
  ),
})

export const generateKey = (prefix: AchievementPrefix, id: string) =>
  `${prefix}${id}`

/**
 * Generate a new achievement item id
 * @returns the generated new achievement item document's id for db.
 */
export const createAchievementItemId = () => nanoid()

/**
 * Generate a new achievement dist id
 * @returns the generated new achievement dist document's id for db.
 */
export const createAchievementDistId = async (client: DefaultClient) => {
  let id = ''
  let stopped = false

  while (!stopped) {
    id = nanoid(10)
    stopped = (await checkForExistingAchievementDist(id, client)) === false
  }
  return id
}

/**
 * Generate a new achievement info document
 * @param base - the achievement info item without ID
 * @returns the generated new achievement info document without ID duplication check
 */
export const getAchievementItemDocument = (
  base: Omit<AchievementItem, 'id'>,
): AchievementItem => ({ ...base, id: createAchievementItemId() }) // Here id will be unique as multiple users might have same achievement unlocked.

/**
 * Generate a new achievement info document
 * @param base - the achievement info item without ID
 * @returns the generated new achievement info document without ID duplication check
 */
export const getAchievementDistDocument = (
  base: Omit<AchievementItem, 'id'>,
): AchievementItem => ({ ...base, id: createAchievementItemId() }) // Here id will be unique as multiple users might have same achievement unlocked.

/**
 * Returns string that available for searching as TAG
 * @param id - the base string
 * @returns the TAG string
 */
export const uuidToQuery = (id: string) => id.replaceAll('-', '\\-')

/**
 * Returns keccak256 version of string
 * @param id - the base string
 * @returns the TAG string
 */
export const clubsUrlToKeccak256Tag = (url: string) =>
  uuidToQuery(keccak256(toUtf8Bytes(encode(url))))

/**
 * Returns true if achievement info is present, else false.
 * @param id - the id of achievement info in db.
 * @returns boolean
 */
export const checkForExistingAchievementInfo = async (
  id: string,
  client: DefaultClient,
) => {
  const keyExists = await client.exists(
    generateKey(AchievementPrefix.AchievementInfo, id),
  )
  console.log({ keyExists })

  return keyExists === 1 ? true : false
}

/**
 * Returns true if achievement item is present, else false.
 * @param id - the id of achievement item in db.
 * @returns boolean
 */
export const checkForExistingAchievementItem = async (
  id: string,
  client: DefaultClient,
) => {
  const keyExists = await client.exists(
    generateKey(AchievementPrefix.AchievementItem, id),
  )
  return keyExists === 1 ? true : false
}

/**
 * Returns true if achievement dist is present, else false.
 * @param id - the id of achievement dist in db.
 * @returns boolean
 */
export const checkForExistingAchievementDist = async (
  id: string,
  client: DefaultClient,
) => {
  const keyExists = await client.exists(
    generateKey(AchievementPrefix.AchievementDist, id),
  )
  return keyExists === 1 ? true : false
}

/**
 * Returns achievement id from the url
 * @param id - the url of the request
 * @parma prepath- the path after which we want the id.
 * @returns string
 */
export const getIdFromURL = (url: URL, prepath: string = 'achievement') => {
  const [, id] =
    aperture(2, url.pathname.split('/')).find(([p]) => p === prepath) ?? []
  return id
}

/**
 * Returns true if the claimer can achievement dist, else false.
 * @param distId - the id of achievement dist in db.
 * @param account - the claimer's EOA
 * @returns result
 */
export const claimableOrNot = async (
  distId: string,
  account: string,
  client: DefaultClient,
): Promise<{
  result: boolean
  reason?: string
  claimed: boolean
  distDocument?: AchievementDist
}> => {
  const distData = await client.ft.search(
    AchievementIndex.AchievementDist,
    `@${ACHIEVEMENT_DIST_SCHEMA['$.id'].AS}:{${uuidToQuery(distId)}}`,
    {
      LIMIT: {
        from: 0,
        size: 1,
      },
    },
  )
  const distDocument = whenDefined(
    distData.documents[0]?.value,
    (doc) => doc as unknown as AchievementDist,
  )
  const isInRecipients = distDocument?.conditions?.recipients
    ? distDocument.conditions.recipients.some((d) => d === account)
    : false
  const maxRedemptions = distDocument?.conditions?.maxRedemptions ?? 0

  const [claimed, noOfclaimedForMaxRedemptions] = await Promise.all([
    client.ft.search(
      AchievementIndex.AchievementItem,
      `@${ACHIEVEMENT_ITEM_SCHEMA['$.achievementDistId'].AS}:{${uuidToQuery(distId)}} @${ACHIEVEMENT_ITEM_SCHEMA['$.account'].AS}:{${uuidToQuery(account)}}`,
      {
        LIMIT: {
          from: 0,
          size: 1,
        },
      },
    ),
    maxRedemptions
      ? client.ft.search(
          AchievementIndex.AchievementItem,
          `@${ACHIEVEMENT_ITEM_SCHEMA['$.achievementDistId'].AS}:{${uuidToQuery(distId)}}`,
          {
            LIMIT: {
              from: 0,
              size: maxRedemptions,
            },
          },
        )
      : Promise.resolve(undefined),
  ])

  const isNotClaimed = claimed.total === 0
  const isNotReachedMaxRedemptions =
    (noOfclaimedForMaxRedemptions?.total ?? 0) > maxRedemptions

  return isNotClaimed && (isInRecipients || isNotReachedMaxRedemptions)
    ? { result: true, distDocument, claimed: false }
    : {
        result: false,
        distDocument,
        reason:
          isNotClaimed === false
            ? 'Achievement is already claimed'
            : isInRecipients === false
              ? 'Is not in recipients'
              : isNotReachedMaxRedemptions === false
                ? 'Already reached to the maxRedemptions'
                : undefined,
        claimed: !isNotClaimed,
      }
}
