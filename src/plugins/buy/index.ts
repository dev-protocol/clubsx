import type { Membership } from '@plugins/memberships'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'

export const getPagePaths = (async (options, { propertyAddress, rpcUrl }) => {
  const products = options.find((opt) => opt.key === 'products')
    ?.value as UndefinedOr<Membership[]>
  return products
    ? [
        { paths: ['buy'], component: Index, props: { products } },
        ...products.map((product) => ({
          paths: ['buy', product.id],
          component: Id,
          props: { propertyAddress, product, rpcUrl },
        })),
      ]
    : []
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths =
  (async () => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:buy',
  displayName: 'Buy',
  category: ClubsPluginCategory.Monetization,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
