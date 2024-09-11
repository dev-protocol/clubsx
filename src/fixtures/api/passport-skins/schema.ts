import { keccak256, toUtf8Bytes } from 'ethers'
import { encode } from '@devprotocol/clubs-core'
import { SchemaFieldTypes, type RediSearchSchema } from 'redis'

export const id = {
  '$.id': {
    type: SchemaFieldTypes.TAG,
    AS: 'id',
  },
} satisfies RediSearchSchema

export const skinId = {
  '$.skinId': {
    type: SchemaFieldTypes.TAG,
    AS: 'skinId',
  },
} satisfies RediSearchSchema

export const skinPayload = {
  '$.skinPayload': {
    type: SchemaFieldTypes.TAG,
    AS: 'skinPayload',
  },
} satisfies RediSearchSchema

export const clubsUrl = {
  '$.clubsUrl': {
    type: SchemaFieldTypes.TAG,
    AS: 'clubsUrl',
  },
} satisfies RediSearchSchema

export const skinStylesheetURI = {
  '$.skinStylesheetURI': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinStylesheetURI',
  },
} satisfies RediSearchSchema

export const skinImagesURIStyleClassName = {
  '$.skinImagesURI[*].styleClassName': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinImagesURIStyleClassName',
  },
} satisfies RediSearchSchema

export const skinImagesURITag = {
  '$.skinImagesURI[*].tag': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinImagesURITag',
  },
} satisfies RediSearchSchema

export const skinImagesURIValue = {
  '$.skinImagesURI[*].value': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinImagesURIValue',
  },
} satisfies RediSearchSchema

export const skinBGMURIs = {
  '$.skinBGMURIs': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinBGMURIs',
  },
} satisfies RediSearchSchema

export const skinVideosURIStyleClassName = {
  '$.skinVideosURI[*].styleClassName': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinVideosURIStyleClassName',
  },
} satisfies RediSearchSchema

export const skinVideosURITag = {
  '$.skinVideosURI[*].tag': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinVideosURITag',
  },
} satisfies RediSearchSchema

export const skinVideosURIValue = {
  '$.skinVideosURI[*].value': {
    type: SchemaFieldTypes.TEXT,
    AS: 'skinVideosURIValue',
  },
} satisfies RediSearchSchema

export type SkinVisualAsset = {
  styleClassName: string // This propety represents the className for which this value is to be used.
  tag: string // This propety represents the HTML id or custom tag (e.g top-left, top-mid-left, etc) for which this value is to be used.
  value: string // This reperesents the value which is to be used.
}

export type PassportSkinDocument = {
  id: string
  skinId: string
  skinPayload: string
  clubsUrl: string
  skinStylesheetURI: string
  skinImagesURI: SkinVisualAsset[]
  skinVideosURI: SkinVisualAsset[]
  skinBGMURIs: string[]
}

export const passportSkinDocument = (doc: {
  id: string | bigint | number
  skinId: string | bigint | number
  skinPayload: string
  clubsUrl: string
  skinStylesheetURI: string
  skinImagesURI: SkinVisualAsset[]
  skinVideosURI: SkinVisualAsset[]
  skinBGMURIs: string[]
}): PassportSkinDocument => ({
  id: doc.id.toString(),
  skinId: doc.skinId.toString(),
  skinPayload: doc.skinPayload,
  clubsUrl: doc.clubsUrl,
  skinStylesheetURI: doc.skinStylesheetURI,
  skinImagesURI: doc.skinImagesURI,
  skinVideosURI: doc.skinVideosURI,
  skinBGMURIs: doc.skinBGMURIs,
})

export const PASSPORTSKIN_SCHEMA = {
  ...id,
  ...skinId,
  ...skinPayload,
  ...clubsUrl,
  ...skinStylesheetURI,
  ...skinImagesURIStyleClassName,
  ...skinImagesURITag,
  ...skinImagesURIValue,
  ...skinBGMURIs,
  ...skinVideosURIStyleClassName,
  ...skinVideosURITag,
  ...skinVideosURIValue,
}

export const PASSPORTSKIN_SCHEMA_ID = keccak256(
  toUtf8Bytes(encode(PASSPORTSKIN_SCHEMA)),
)
