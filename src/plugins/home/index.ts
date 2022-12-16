import type { Tiers } from '@constants/tier'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { HomeConfig } from '../../constants/homeConfig'
import { NavLink } from '@constants/navLink'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, propertyAddress, rpcUrl, ...config }
) => {
  const tiers = options.find((opt) => opt.key === 'tiers')
    ?.value as UndefinedOr<Tiers>

  const homeConfig = options.find((opt) => opt.key === 'homeConfig')
    ?.value as UndefinedOr<HomeConfig>

  const sidebarPrimaryLinks =
    config.options?.find((option) => option.key === 'sidebarPrimaryLinks')
      ?.value ?? ([] as NavLink[])

  const sidebarLinks =
    config.options?.find((option) => option.key === 'sidebarLinks')?.value ??
    ([] as NavLink[])

  const avatarImgSrc = config.options?.find(
    (option) => option.key === 'avatarImgSrc'
  )?.value

  return [
    {
      paths: [''],
      component: Index,
      props: {
        name,
        propertyAddress,
        tiers,
        homeConfig,
        rpcUrl,
        sidebarPrimaryLinks,
        sidebarLinks,
        avatarImgSrc,
      },
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

export const meta: ClubsPluginMeta = {
  displayName: 'Home',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
