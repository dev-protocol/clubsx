import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Plugins } from './plugins.astro'
import { default as Overview } from './overview.astro'
import { default as Funds } from './funds.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (_, config) => [
  {
    paths: ['general'],
    component: Index,
    props: { config },
  },
  {
    paths: ['plugins'],
    component: Plugins,
    props: {},
  },
  {
    paths: ['overview'],
    component: Overview,
    props: { propertyAddress: config.propertyAddress, rpcUrl: config.rpcUrl },
  },
  {
    paths: [''],
    component: Overview,
    props: { propertyAddress: config.propertyAddress, rpcUrl: config.rpcUrl },
  },
  {
    paths: ['funds'],
    component: Funds,
    props: { propertyAddress: config.propertyAddress, rpcUrl: config.rpcUrl },
  },
]

export const meta: ClubsPluginMeta = {
  id: 'clubs-core:admin',
  displayName: 'Example',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
