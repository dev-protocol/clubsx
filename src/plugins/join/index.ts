import { tiers } from '@constants/tier'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { propertyAddress, name }
) => [
  { paths: ['join'], component: Index },
  ...tiers.map(({ id }) => ({
    paths: ['join', id],
    component: Id,
    props: { propertyAddress, name },
  })),
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
