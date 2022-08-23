import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  _,
  { name, propertyAddress }
) => [{ paths: [''], component: Index, props: { name, propertyAddress } }]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
