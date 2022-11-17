import type { Tiers } from '@constants/tier'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { HomeConfig } from './types/home-config'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, propertyAddress, rpcUrl }
) => {
  const tiers = options.find((opt) => opt.key === 'tiers')
    ?.value as UndefinedOr<Tiers>

  const homeConfig = options.find((opt) => opt.key === 'homeConfig')
    ?.value as UndefinedOr<HomeConfig>

  return [
    {
      paths: [''],
      component: Index,
      props: { name, propertyAddress, tiers, homeConfig, rpcUrl },
    },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (options, _) => [
  {
    paths: ['home'],
    component: Admin,
    props: { options },
  },
]

export const meta: ClubsPluginMeta = { displayName: 'Home' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
