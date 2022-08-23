import type { Perks } from '@constants/perks'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { UndefinedOr } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { propertyAddress, name }
) => {
  const perks = options.find((opt) => opt.key === 'perks')
    ?.value as UndefinedOr<Perks>

  return [
    {
      paths: ['perks'],
      component: Index,
      props: { propertyAddress, name, perks },
    },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export default {
  getPagePaths,
  getAdminPaths,
} as ClubsFunctionPlugin
