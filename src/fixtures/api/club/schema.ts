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

export const ownerAddress = {
  '$.owner.address': {
    type: SchemaFieldTypes.TAG,
    AS: 'ownerAddress',
  },
} satisfies RediSearchSchema

export const ownerFirebaseUID = {
  '$.owner.firebaseUid': {
    type: SchemaFieldTypes.TAG,
    AS: 'ownerFirebaseUID',
  },
} satisfies RediSearchSchema

export const createdAt = {
  '$.created_at': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'created_at',
  },
} satisfies RediSearchSchema

export type ClubDocument = {
  id: string
  propertyAddress: string
  created_at?: number
  owner?: {
    address?: string
    firebaseUid?: string
  }
}

export const CLUB_SCHEMA = {
  ...id,
  ...propertyAddress,
  ...createdAt,
  ...ownerAddress,
  ...ownerFirebaseUID,
}

export const CLUB_SCHEMA_ID = keccak256(toUtf8Bytes(encode(CLUB_SCHEMA)))
