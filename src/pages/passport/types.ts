import type { AssetDocument } from '@fixtures/api/assets/schema'

export type PassportItem = AssetDocument & {
  assetId: string
  passportDocId: string
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
  itemAssetValue: string
}
