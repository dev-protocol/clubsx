import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/me-1.jpg'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress, rpcUrl },
) => [{ paths: ['me'], component: Index, props: { propertyAddress, rpcUrl } }]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:me',
  displayName: 'Me',
  category: ClubsPluginCategory.Uncategorized,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `User's personal page.`,
  previewImages: [Preview1.src],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
