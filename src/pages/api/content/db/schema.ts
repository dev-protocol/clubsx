import { keccak256, toUtf8Bytes } from 'ethers'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'

import { encode } from '@devprotocol/clubs-core'

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const sTokenPayload = {
  '$.sTokenPayload': {
    type: SchemaFieldTypes.TAG,
    AS: 'sTokenPayload',
  },
} satisfies RediSearchSchema

export const source = {
  '$.source': {
    type: SchemaFieldTypes.TAG,
    AS: 'source',
  },
} satisfies RediSearchSchema

export const createdOnTimestamp = {
  '$.createdOnTimestamp': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'createdOnTimestamp',
  },
} satisfies RediSearchSchema

export const CONTENT_INFO_SCHEMA = {
  ...id,
  ...sTokenPayload,
  ...source,
  ...createdOnTimestamp,
}

export const CONTENT_INFO_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(CONTENT_INFO_SCHEMA)),
)

export type ContentDocument = {
  id: string
  sTokenPayload: string
  source: string
  createdOnTimestamp: number
}
