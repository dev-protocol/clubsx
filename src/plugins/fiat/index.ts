import { Products } from '@constants/products'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { UndefinedOr } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'

export type PriceOverrides = {
  id: string
  currency: string
  price: number
  purchaseLink: string
}[]

export const getPagePaths: ClubsFunctionGetPagePaths = async (options) => {
  const products = options.find((opt) => opt.key === 'products')
    ?.value as UndefinedOr<Products>
  const priceOverrides = options.find((opt) => opt.key === 'priceOverrides')
    ?.value as UndefinedOr<PriceOverrides>

  return products && priceOverrides
    ? [
        {
          paths: ['fiat'],
          props: { products, priceOverrides },
          component: Index,
        },
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'FIAT' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
