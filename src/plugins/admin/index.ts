import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Plugins } from './plugins.astro'
import { default as Overview } from './overview.astro'
export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  _,
  { name, description, twitterHandle, propertyAddress, rpcUrl }
) => [
  {
    paths: [],
    component: Index,
    props: { name, description, twitterHandle, propertyAddress },
  },
  {
    paths: ['plugins'],
    component: Plugins,
    props: {},
  },
  {
    paths: ['overview'],
    component: Overview,
    props: { propertyAddress, rpcUrl },
  },
]

export const meta: ClubsPluginMeta = {
  displayName: 'Example',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
