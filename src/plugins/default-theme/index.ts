import type { Tiers } from '@constants/tier'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetLayout,
  ClubsFunctionGetPagePaths,
  ClubsFunctionThemePlugin,
  ClubsPluginCategory,
  ClubsThemePluginMeta,
} from '@devprotocol/clubs-core'
import { default as Layout } from '@layouts/Default.astro'
import { default as Index } from '@plugins/home/index.astro'
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

  return homeConfig
    ? [
        {
          paths: ['theme'],
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
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  config
) => [
  {
    paths: ['theme'],
    component: Admin,
    props: { options, config },
  },
]

export const getLayout: ClubsFunctionGetLayout = async () => ({
  layout: Layout,
  props: {},
})

export const meta: ClubsThemePluginMeta = {
  displayName: 'Default theme',
  category: ClubsPluginCategory.Theme,
  theme: {
    previewImage: 'https://dummyimage.com/600x400/000/fff',
  },
}

export default {
  getPagePaths,
  getAdminPaths,
  getLayout,
  meta,
} as ClubsFunctionThemePlugin
