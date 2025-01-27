import { bytes32Hex } from '@devprotocol/clubs-core'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'
import { hashToItem } from '@fixtures/router/passportItem'
import type { Clip, Skin } from '@pages/api/profile'
import type { PassportClip } from '@pages/passport/types'
import { toUtf8Bytes } from 'ethers'

export const getPassportOgImages = ({
  url: requestURL,
  user,
  skins,
  skinId,
  clip: givenClip,
  itemHash,
}: {
  url: URL
  user: string
  skins?: Skin[]
  skinId: string
  clip?: Clip | PassportClip
  itemHash?: string
}): { x: string; default: string } => {
  const ogImageURLHost = requestURL.origin.includes('prerelease.clubs.place')
    ? 'prerelease.clubs.place'
    : requestURL.origin.includes('clubs.place')
      ? 'clubs.place'
      : `${requestURL.hostname}:${requestURL.port}`
  const skin = skins?.find((x) => (skinId ? x.id === skinId : x))
  const clip = givenClip
    ? givenClip
    : (whenDefined(itemHash, (item_) =>
        whenNotError(hashToItem(item_), (res) =>
          ((skin && res.type in skin ? skin[res.type] : []) as Clip[])!.find(
            (y) => y.id === res.id,
          ),
        ),
      ) ?? new Error())
  const cacheKey = toUtf8Bytes(
    isNotError(clip) ? JSON.stringify(clip) : JSON.stringify(skin),
  )
  const ogpImageURL = `${requestURL.protocol}//${ogImageURLHost}/og/image/passport/${user}/${skinId ? skinId : ''}${itemHash ? `/${itemHash}` : ''}?cache=${bytes32Hex(cacheKey)}`
  const image = `https://capture.clubs.place/api/generate?h=630&w=1200&src=${ogpImageURL}`
  const imageX = `https://capture.clubs.place/api/generate?h=675&w=1200&src=${ogpImageURL}`
  return { default: image, x: imageX }
}
