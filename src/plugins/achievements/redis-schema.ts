import { encode } from '@devprotocol/clubs-core'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'
import { keccak256, toUtf8Bytes } from 'ethers'
import { nanoid } from 'nanoid'

export enum AchievementIndex {
  Achievement = 'idx::devprotocol:clubs:achievement:code',
  History = 'idx::devprotocol:clubs:achievement:history',
}

export enum AchievementPrefix {
  Achievement = 'doc::devprotocol:clubs:achievement:code::',
  History = 'doc::devprotocol:clubs:achievement:history::',
}

export enum AchievementSchemaKey {
  Achievement = 'scm::devprotocol:clubs:achievement:code',
  History = 'scm::devprotocol:clubs:achievement:history',
}

export type NumberAttribute = {
  trait_type: string
  display_type: string
  value: string
}

export type StringAttribute = {
  trait_type: string
  value: string
}

export type Achievement = {
  id: string
  contract: string
  metadata: {
    name: string
    description: string
    image: string
    numberAttributes: NumberAttribute[]
    stringAttributes: StringAttribute[]
  }
}

export type AchievementForDb = {
  id: string
  contract: string
  metadata: {
    name: string
    description: string
    image: string
    numberAttributes: string
    stringAttributes: string
  }
}

export type AchievementHistory = {
  id: string
  usedId: string
  datetime: number
  account: string
}

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const contract = {
  '$.contract': {
    type: SchemaFieldTypes.TAG,
    AS: 'contract',
  },
} satisfies RediSearchSchema

export const metadataName = {
  '$.metadata.name': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataName',
  },
} satisfies RediSearchSchema

export const metadataDescription = {
  '$.metadata.description': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataDescription',
  },
} satisfies RediSearchSchema

export const metadataImage = {
  '$.metadata.image': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataImage',
  },
} satisfies RediSearchSchema

export const metadataNumberAttributes = {
  '$.metadata.numberAttributes': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataNumberAttributes',
  },
} satisfies RediSearchSchema

export const metadataStringAttributes = {
  '$.metadata.stringAttributes': {
    type: SchemaFieldTypes.TEXT,
    AS: 'metadataStringAttributes',
  },
} satisfies RediSearchSchema

export const usedId = {
  '$.usedId': {
    type: SchemaFieldTypes.TAG,
    AS: 'usedId',
  },
} satisfies RediSearchSchema

export const datetime = {
  '$.datetime': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'datetime',
  },
} satisfies RediSearchSchema

export const account = {
  '$.account': {
    type: SchemaFieldTypes.TAG,
    AS: 'account',
  },
} satisfies RediSearchSchema

export const schemaAchievement = {
  ...id,
  ...contract,
  ...metadataName,
  ...metadataDescription,
  ...metadataImage,
  ...metadataNumberAttributes,
  ...metadataStringAttributes,
}

export const schemaAchievementsHistory = {
  ...id,
  ...usedId,
  ...datetime,
  ...account,
}

export const schemaAchievementId = keccak256(
  toUtf8Bytes(encode(schemaAchievement)),
)

export const schemaAchievementsHistoryId = keccak256(
  toUtf8Bytes(encode(schemaAchievementsHistory)),
)

/**
 * Generate a new achievement document
 * @param base - the achievement item without ID
 * @returns the generated new achievement document without ID duplication check
 */
export const achievementDocument = (
  base: Omit<Achievement, 'id'>,
): Achievement => ({ ...base, id: nanoid(10) })

/**
 * Generate a new history document
 * @param base - the history item without ID
 * @returns the generated new history document without ID duplication check
 */
export const achievementHistoryDocument = (
  base: Omit<AchievementHistory, 'id'>,
): AchievementHistory => ({
  ...base,
  id: nanoid(),
})

/**
 * Returns string that available for searching as TAG
 * @param id - the base string
 * @returns the TAG string
 */
export const uuidToQuery = (id: string) => id.replaceAll('-', '\\-')
