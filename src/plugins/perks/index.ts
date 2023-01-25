import type { Perks } from '@constants/perks'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, rpcUrl }
) => {
  const perks = options.find((opt) => opt.key === 'perks')
    ?.value as UndefinedOr<Perks>

  return [
    {
      paths: ['perks'],
      component: Index,
      props: { propertyAddress, perks, rpcUrl },
    },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = {
  displayName: 'Perks',
  category: ClubsPluginCategory.Growth,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
