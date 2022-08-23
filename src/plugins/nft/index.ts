import type { Products } from '@constants/products'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (options) => {
  const products = options.find((opt) => opt.key === 'products')
    ?.value as UndefinedOr<Products>
  return products
    ? [{ paths: ['nft'], component: Index, props: { products } }]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
