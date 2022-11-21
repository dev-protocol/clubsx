import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress, name, rpcUrl }
) => [{ paths: ['me'], component: Index, props: { propertyAddress, name, rpcUrl} }]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Me' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
