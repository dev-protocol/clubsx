import type { Perks } from '@constants/perks'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { UndefinedOr } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress }
) => {
  const perks = options.find((opt) => opt.key === 'perks')
    ?.value as UndefinedOr<Perks>

  return [
    {
      paths: ['perks'],
      component: Index,
      props: { propertyAddress, perks },
    },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'Perks' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
