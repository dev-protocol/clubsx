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
    | 'image-playable'
    | 'image-playable-link'
    | 'video'
    | 'video-link'
    | 'bgm'
    | 'bgm-link'
    | 'short-video'
    | 'short-video-link'
    | 'short-video-controlled'
    | 'short-video-controlled-link'
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
    createdAt?: number
    updatedAt?: number
  }
