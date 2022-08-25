import type { Tiers } from '@constants/tier'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, propertyAddress }
) => {
  const tiers = options.find((opt) => opt.key === 'tiers')
    ?.value as UndefinedOr<Tiers>

  return [
    { paths: [''], component: Index, props: { name, propertyAddress, tiers } },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
