import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => [
  { paths: ['quests'], component: Index },
  { paths: ['quests', 'quest_starter'], component: Id },
  { paths: ['quests', 'quest_stake_100'], component: Id },
  { paths: ['quests', 'quest_stake_500'], component: Id },
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
