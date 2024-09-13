import { keccak256, toUtf8Bytes } from 'ethers'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'
import { encode } from '@devprotocol/clubs-core'

export const type = {
  '$.type': {
    type: SchemaFieldTypes.TAG,
    AS: 'type',
  },
} satisfies RediSearchSchema

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TEXT,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const nId = {
  '$.n_id': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'nId',
    SORTABLE: true,
  },
} satisfies RediSearchSchema

export const contract = {
  '$.contract': {
    type: SchemaFieldTypes.TAG,
    AS: 'contract',
  },
} satisfies RediSearchSchema

export const propertyAddress = {
  '$.propertyAddress': {
    type: SchemaFieldTypes.TAG,
    AS: 'propertyAddress',
  },
} satisfies RediSearchSchema

export const owner = {
  '$.owner': {
    type: SchemaFieldTypes.TAG,
    AS: 'owner',
  },
} satisfies RediSearchSchema

export const block = {
  '$.block': {
    type: SchemaFieldTypes.TEXT,
    AS: 'block',
  },
} satisfies RediSearchSchema

export const nBlock = {
  '$.n_block': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'nBlock',
    SORTABLE: true,
  },
} satisfies RediSearchSchema

export const balance = {
  '$.balance': {
    type: SchemaFieldTypes.TEXT,
    AS: 'balance',
  },
} satisfies RediSearchSchema

export const nBalance = {
  '$.n_balance': {
    type: SchemaFieldTypes.NUMERIC,
    AS: 'nBalance',
    SORTABLE: true,
  },
} satisfies RediSearchSchema

export type AssetContractType = 'sTokens' | 'sbt' | 'property'

export type AssetDocument = {
  type: 'nft' | 'sbt' | 'property' | 'passport-item'
  id?: string
  nId?: number
  contract: string
  propertyAddress?: string
  owner: string
  block: string
  nBlock: number
  balance: string
  nBalance: number
}

export const assetDocument = (doc: {
  type: AssetDocument['type']
  id?: string | bigint | number
  contract: string
  propertyAddress?: string
  owner: string
  block: string | bigint | number
  balance: string | bigint | number
}): AssetDocument => ({
  type: doc.type,
  id: doc.id ? doc.id.toString() : undefined,
  contract: doc.contract,
  propertyAddress: doc.propertyAddress,
  owner: doc.owner,
  block: doc.block.toString(),
  balance: doc.balance.toString(),
  nId: doc.id ? Number(doc.id) : undefined,
  nBlock: Number(doc.block),
  nBalance: Number(doc.balance),
})

export const assetDocumentTypes: ReadonlyArray<AssetDocument['type']> = [
  'nft',
  'property',
  'sbt',
  'passport-item',
]

export const assetContractTypes: ReadonlyArray<AssetContractType> = [
  'sTokens',
  'property',
  'sbt',
]

export type LogDocument = {
  contract: string
  block: string
  nBlock: number
}

export const ASSET_SCHEMA = {
  ...type,
  ...id,
  ...contract,
  ...propertyAddress,
  ...owner,
  ...block,
  ...balance,
  ...nId,
  ...nBlock,
  ...nBalance,
}

export const LOG_SCHEMA = {
  ...contract,
  ...block,
  ...nBlock,
}

export const ASSET_SCHEMA_ID = keccak256(toUtf8Bytes(encode(ASSET_SCHEMA)))
export const LOG_SCHEMA_ID = keccak256(toUtf8Bytes(encode(LOG_SCHEMA)))
