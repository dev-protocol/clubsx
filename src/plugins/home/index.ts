import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => [] // MOVE TO src/plugins/default-theme/index.ts

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => [] // MOVE TO src/plugins/default-theme/index.ts

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:home',
  displayName: 'Home',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
