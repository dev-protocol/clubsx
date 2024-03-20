import type { UndefinedOr } from '@devprotocol/util-ts'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetApiPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, SinglePath } from '@devprotocol/clubs-core'

import Id from './pages/[id].astro'
import { Content as Readme } from './README.md'
import { default as Icon } from './assets/icon.svg' // @TODO: replace this.
import addAchievements from './handlers/addAchievement'
import claimAchievement from './handlers/claimAchievement'
import checkAchievement from './handlers/checkAchievement'
import fetchAchievement from './handlers/fetchAchievementId'
import { PLUGIN_ACHIEVEMENT_IDS_OPTION_KEY } from './utils'

export const getPagePaths = (async (options, config) => {
  const achievementIds =
    (options.find((opt) => opt.key === PLUGIN_ACHIEVEMENT_IDS_OPTION_KEY)
      ?.value as UndefinedOr<string[]>) ?? []

  return [
    ...achievementIds.map((id: string) => ({
      paths: ['achievement', id],
      component: Id,
      props: {},
    })),
  ]
}) satisfies ClubsFunctionGetPagePaths

export const getApiPaths = (async (options, config, _) => {
  return [
    {
      paths: ['achievements', SinglePath],
      method: 'GET',
      handler: fetchAchievement,
    },
    {
      paths: ['achievements', 'check', SinglePath],
      method: 'GET',
      handler: checkAchievement,
    },
    {
      paths: ['achievements'],
      method: 'POST',
      handler: addAchievements(config),
    },
    {
      paths: ['achievements', 'claim'],
      method: 'POST',
      handler: claimAchievement({
        rpcUrl: config.rpcUrl,
        chainId: config.chainId,
        property: config.propertyAddress,
      }),
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
  previewImages: [Icon.src, Icon.src, Icon.src], // @TODO: replace this.
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getApiPaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
