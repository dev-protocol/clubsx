import { keccak256, toUtf8Bytes } from 'ethers'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'

import { encode } from '@devprotocol/clubs-core'

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

export const account = {
  '$.account': {
    type: SchemaFieldTypes.TAG,
    AS: 'account',
  },
} satisfies RediSearchSchema

export const claimed = {
  '$.claimed': {
    type: SchemaFieldTypes.TAG,
    AS: 'claimed',
  },
} satisfies RediSearchSchema

export const createdOnTimestamp = {
  '$.createdOnTimestamp': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'createdOnTimestamp',
  },
} satisfies RediSearchSchema

export const claimedOnTimestamp = {
  '$.claimedOnTimestamp': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'claimedOnTimestamp',
  },
} satisfies RediSearchSchema

export const claimedSBTTokenId = {
  '$.claimedSBTTokenId': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'claimedSBTTokenId',
  },
} satisfies RediSearchSchema

export const ACHIEVEMENT_SCHEMA = {
  ...id,
  ...contract,
  ...metadataName,
  ...metadataDescription,
  ...metadataImage,
  ...metadataNumberAttributes,
  ...metadataStringAttributes,
  ...account,
  ...claimed,
  ...createdOnTimestamp,
  ...claimedOnTimestamp,
  ...claimedSBTTokenId,
}

export const ACHIEVEMENT_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(ACHIEVEMENT_SCHEMA)),
)
