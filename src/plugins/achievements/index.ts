import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetApiPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, SinglePath } from '@devprotocol/clubs-core'
import { default as Icon } from './assets/icon.svg' // @todo: replace this icon
import { Content as Readme } from './README.md'

import addAchievements from './handlers/addAchievement'

export const getPagePaths = (async (options, config) => {
  return []
}) satisfies ClubsFunctionGetPagePaths

export const getApiPaths = (async (
  options,
  config,
  { getPluginConfigById },
) => {
  return [
    {
      paths: ['invitations'],
      method: 'POST',
      handler: addAchievements(config),
    },
  ]
}) satisfies ClubsFunctionGetApiPaths

export const getAdminPaths = (async (
  options,
  config,
) => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:achievements',
  displayName: 'Achievements',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  description: `Basic theme with multiple color schemes.`,
  // previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getApiPaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
