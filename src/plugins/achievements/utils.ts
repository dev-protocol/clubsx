import { nanoid } from 'nanoid'
import { ZeroAddress, keccak256, toUtf8Bytes } from 'ethers'

import { encode } from '@devprotocol/clubs-core'

import { getDefaultClient } from './db/redis'
import type { Achievement, AchievementInfo, AchievementItem } from './types'
import { aperture } from 'ramda'

export enum AchievementIndex {
  AchievementInfo = 'idx::devprotocol:clubs:achievement:info',
  AchievementItem = 'idx::devprotocol:clubs:achievement:item',
}

export enum AchievementPrefix {
  AchievementInfo = 'doc::devprotocol:clubs:achievement:info::',
  AchievementItem = 'doc::devprotocol:clubs:achievement:item::',
}

export enum AchievementSchemaKey {
  AchievementInfo = 'scm::devprotocol:clubs:achievement:info',
  AchievementItem = 'scm::devprotocol:clubs:achievement:item',
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

/**
 * Generate a new achievement item id
 * @returns the generated new achievement item document's id for db.
 */
export const createAchievementItemId = () => nanoid(10)

/**
 * Generate a new achievement info document
 * @param base - the achievement info item without ID
 * @returns the generated new achievement info document without ID duplication check
 */
export const getAchievementItemDocument = (
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
export const checkForExistingAchievementInfo = async (id: string) => {
  const client = await getDefaultClient()
  const keyExists = await client.exists(
    `${AchievementPrefix.AchievementInfo}::${id}`,
  )

  await client.quit()

  return keyExists === 1 ? true : false
}

/**
 * Returns true if achievement item is present, else false.
 * @param id - the id of achievement item in db.
 * @returns boolean
 */
export const checkForExistingAchievementItem = async (id: string) => {
  const client = await getDefaultClient()
  const keyExists = await client.exists(
    `${AchievementPrefix.AchievementItem}::${id}`,
  )
  await client.quit()
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
