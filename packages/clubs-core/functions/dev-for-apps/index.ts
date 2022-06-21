import { always } from 'ramda'

export const StrapiBaseUrl = 'https://dev-for-apps.azureedge.net'

export type ImageFormat = {
  url: string
  width: number
  height: number
  hash: string
  name: string
  mime: string
  size: number
}

export type Image = ImageFormat & {
  id: number
  formats?: {
    thumbnail: ImageFormat
    small: ImageFormat
    medium: ImageFormat
    large: ImageFormat
  }
}

export interface Account {
  id: number
  name: string
  biography: string
  portrait: Image
  cover_images: Image[]
}

export const getAccount = (walletAddress: string): Promise<Array<Account>> =>
  fetch(`${StrapiBaseUrl}/accounts?address=${walletAddress}`)
    .then((res) => res.json())
    .catch(always([]))
