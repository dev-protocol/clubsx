import { products } from '@constants/products'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress }
) => [
  { paths: ['buy'], component: Index },
  ...products.map(({ id }) => ({
    paths: ['buy', id],
    component: Id,
    props: { id, propertyAddress },
  })),
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
