import { keccak256, toUtf8Bytes } from 'ethers'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'
import { encode } from '@devprotocol/clubs-core'

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const propertyAddress = {
  '$.propertyAddress': {
    type: SchemaFieldTypes.TAG,
    AS: 'propertyAddress',
  },
} satisfies RediSearchSchema

export type ClubDocument = {
  id: string
  propertyAddress: string
}

export const CLUB_SCHEMA = {
  ...id,
  ...propertyAddress,
}

export const CLUB_SCHEMA_ID = keccak256(toUtf8Bytes(encode(CLUB_SCHEMA)))
