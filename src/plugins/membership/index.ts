import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => [
  { paths: ['membership'], component: Admin, props: {} },
]

export const meta: ClubsPluginMeta = { displayName: 'Membership' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
