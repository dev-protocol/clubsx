import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/members-1.jpg'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress, rpcUrl },
) => [
  { paths: ['members'], component: Index, props: { propertyAddress, rpcUrl } },
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:members',
  displayName: 'Members',
  category: ClubsPluginCategory.Growth,
  icon: Icon,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `List of membership holders.`,
  previewImages: [Preview1],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
