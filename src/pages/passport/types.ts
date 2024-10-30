import type { AssetDocument } from '@fixtures/api/assets/schema'

export type ImageData = {
  h: number
  w: number
  src: string
  alt: string
}

export type PassportItemIndexDoc = {
  id: string
  sTokenId?: string
  sTokenPayload: string
  clubsUrl: string
  itemAssetType:
    | 'css'
    | 'stylesheet-link'
    | 'image'
    | 'image-link'
    | 'video'
    | 'video-link'
    | 'bgm'
    | 'bgm-link'
    | 'short-video'
    | 'short-video-link'
  itemAssetValue: string
}

export type PassportItem = AssetDocument &
  PassportItemIndexDoc & {
    assetId: string
    passportDocId: string
  }

export type PassportClip = AssetDocument &
  PassportItemIndexDoc & {
    description: string
    frameColorHex: string
  }
