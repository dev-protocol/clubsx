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
import Preview1 from './assets/members-1.jpg'

export const getPagePaths = (async (_, { propertyAddress, rpcUrl }) => [
  { paths: ['members'], component: Index, props: { propertyAddress, rpcUrl } },
]) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths =
  (async () => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:members',
  displayName: 'Members',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `List of membership holders.`,
  previewImages: [Preview1.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
