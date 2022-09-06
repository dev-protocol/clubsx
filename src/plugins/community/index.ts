import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => [
  { paths: ['community'], component: Index },
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Community' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
