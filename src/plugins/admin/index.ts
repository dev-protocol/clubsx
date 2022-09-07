import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Plugins } from './plugins.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  _,
  { name, description, twitterHandle, propertyAddress }
) => [
  {
    paths: ['example'],
    component: Index,
    props: { name, description, twitterHandle, propertyAddress },
  },
  {
    paths: ['plugins'],
    component: Plugins,
    props: { },
  },
]

export const meta: ClubsPluginMeta = { displayName: 'Example' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
