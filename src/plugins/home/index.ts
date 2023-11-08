import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'

export const getPagePaths = (async () => []) satisfies ClubsFunctionGetPagePaths // MOVE TO src/plugins/default-theme/index.ts

export const getAdminPaths =
  (async () => []) satisfies ClubsFunctionGetAdminPaths // MOVE TO src/plugins/default-theme/index.ts

export const meta = {
  id: 'devprotocol:clubs:plugin:home',
  displayName: 'Home',
  category: ClubsPluginCategory.Uncategorized,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
