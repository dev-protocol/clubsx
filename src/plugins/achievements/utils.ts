import { nanoid } from 'nanoid'

import type { Achievement } from './types'
import { getDefaultClient } from './db/redis'

export const ACHIEVEMENT_INDEX = 'idx::devprotocol:clubs:achievement:code'
export const ACHIEVEMENT_PREFIX = 'doc::devprotocol:clubs:achievement:code::'
export const ACHIEVEMENT_SCHEMA_KEY = 'scm::devprotocol:clubs:achievement:code'

/**
 * Generate a new achievement document
 * @param base - the achievement item without ID
 * @returns the generated new achievement document without ID duplication check
 */
export const getAchievementDocument = (
  base: Omit<Achievement, 'id'>,
): Achievement => ({ ...base, id: nanoid(10) })

/**
 * Returns string that available for searching as TAG
 * @param id - the base string
 * @returns the TAG string
 */
export const uuidToQuery = (id: string) => id.replaceAll('-', '\\-')

export const checkForExistingAchievementId = async (id: string) => {
  const client = await getDefaultClient()
  const keyExists = await client.exists(`${ACHIEVEMENT_PREFIX}::${id}`)
  return keyExists === 1 ? true : false
}
