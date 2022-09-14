import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { default as Id } from './[id].astro'

const questParams = ['quest_starter', 'quest_stake_100', 'quest_stake_500']

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress, name }
) => [
  { paths: ['quests'], component: Index },
  ...questParams.map((param) => ({
    paths: ['quests', param],
    component: Id,
    props: { propertyAddress, name },
  })),
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  {}
) => [
  {
    paths: ['quests'],
    component: Admin,
    props: { options },
  },
]

export const meta: ClubsPluginMeta = { displayName: 'Quests' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
