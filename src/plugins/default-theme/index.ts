import type { UndefinedOr } from '@devprotocol/util-ts'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetLayout,
  ClubsFunctionGetPagePaths,
  ClubsFunctionThemePlugin,
  ClubsThemePluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Layout } from './layouts/Default.astro'
import { default as Index } from './pages/index.astro'
import { default as Admin } from './admin.astro'
import type { HomeConfig } from '../../constants/homeConfig'
import type { NavLink } from '@constants/navLink'
import type { Membership } from '@plugins/memberships'
import PreviewImage from './assets/preview.jpg'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/default-theme-1.jpg'
import Preview2 from './assets/default-theme-2.jpg'
import Preview3 from './assets/default-theme-3.jpg'

import OrangeTheme from './styles/themes/orange/main.scss'

type ClubsThemeColorsDefaultOnly = {
  default: string,
  ink: string
}

type ClubsThemeSchema = {
  background: string,
  backgroundGradient?: [string, string],
  backgroundInk: string
  themeFile: any
}

export type GlobalConfigValue = {
  bg?: string // TODO: Remove these when finished
  bgGradient?: [string, string] // TODO: Remove these when finished
  ink?: string // TODO: Remove these when finished
  theme?: ClubsThemeSchema | any // TODO: Remove undefined when finished
  themeMode: 'dark' | 'light'
}

export const colorPresets: Record<string, GlobalConfigValue> = {
  Purple: {
    bg: 'rgba(131, 138, 176, 1)',
    bgGradient: ['rgba(204, 0, 255, 0.2)', 'rgba(204, 0, 255, 0)'],
    ink: 'rgba(255, 255, 255)',
    themeMode: 'dark'
  },
  Grey: {
    bg: 'rgba(173, 173, 173, 1)',
    ink: '#111111',
    themeMode: 'light'
  },
  Black: {
    bg: 'rgba(29, 36, 38, 1)',
    ink: 'rgba(255, 255, 255, 1)',
    themeMode: 'dark'
  },
  Brown: {
    bg: 'rgba(68, 59, 45, 1)',
    bgGradient: ['rgba(255, 201, 119, 0.2)', 'rgba(255, 201, 119, 0)'],
    ink: 'rgb(252, 225, 203)',
    themeMode: 'dark'
  },
  Stone: {
    bg: 'rgba(96, 119, 124, 1)',
    bgGradient: ['rgba(196, 196, 196, 0.5)', 'rgba(196, 196, 196, 0)'],
    ink: 'rgba(255, 255, 255, 1)',
    themeMode: 'dark'
  },
  Matcha: {
    bg: 'rgba(63, 78, 38, 1)',
    ink: 'rgb(252, 225, 203)',
    themeMode: 'dark'
  },
  Pink: {
    bg: 'rgba(255, 187, 195, 1)',
    bgGradient: ['rgba(255, 173, 217, 1)', 'rgba(255, 173, 217, 0)'],
    ink: 'rgba(255, 255, 255)',
    themeMode: 'light'
  },
  Blue: {
    bg: 'rgba(91, 139, 245, 1)',
    ink: 'rgba(255, 255, 255)',
    themeMode: 'dark'
  },
  Orange: {
    bg: 'rgba(255, 131, 83, 1)',
    bgGradient: ['rgba(249, 192, 82, 1)', 'rgba(249, 192, 82, 0)'],
    ink: 'rgba(255, 255, 255)',
    theme: OrangeTheme,
    themeMode: 'dark'
  },
}

export type HomeConfigValue = {
  hero?: {
    image?: string
  }
  description?: string
  body?: string
}

export const getPagePaths = (async (
  options,
  config,
  { getPluginConfigById },
) => {
  const { name, propertyAddress, rpcUrl, chainId } = config

  const [membershipConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const allMemberships = membershipConfig?.options.find(
    (opt) => opt.key === 'memberships',
  )?.value as UndefinedOr<Membership[]>

  // Filter out deprecated memberships.
  const memberships = allMemberships?.filter(
    (membership) => !membership.deprecated,
  )

  const homeConfig = options.find((opt) => opt.key === 'homeConfig')
    ?.value as UndefinedOr<HomeConfig>

  const sidebarPrimaryLinks =
    config.options?.find((option) => option.key === 'sidebarPrimaryLinks')
      ?.value ?? ([] as NavLink[])

  const sidebarLinks =
    config.options?.find((option) => option.key === 'sidebarLinks')?.value ??
    ([] as NavLink[])

  const avatarImgSrc = config.options?.find(
    (option) => option.key === 'avatarImgSrc',
  )?.value

  return homeConfig
    ? [
        {
          paths: [],
          component: Index,
          props: {
            name,
            propertyAddress,
            memberships,
            homeConfig,
            rpcUrl,
            chainId,
            sidebarPrimaryLinks,
            sidebarLinks,
            avatarImgSrc,
            signals: ['connection-button-hide'],
          },
        },
      ]
    : []
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (options, config) => [
  {
    paths: ['theme'],
    component: Admin,
    props: { options, config, colorPresets },
  },
]) satisfies ClubsFunctionGetAdminPaths

export const getLayout = (async (options, config, { getPluginConfigById }) => {
  const [membershipConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const memberships = membershipConfig?.options.find(
    (opt) => opt.key === 'memberships',
  )?.value as UndefinedOr<Membership[]>

  const globalConfig = options.find((opt) => opt.key === 'globalConfig')?.value
  const homeConfig = options.find((opt) => opt.key === 'homeConfig')
    ?.value as UndefinedOr<HomeConfigValue>
  const description = homeConfig?.description

  return {
    layout: Layout,
    props: {
      theme1: { config, homeConfig, globalConfig, memberships, description },
    },
  }
}) satisfies ClubsFunctionGetLayout

export const meta = {
  id: 'devprotocol:clubs:theme-1',
  displayName: 'Minimalist',
  category: ClubsPluginCategory.Theme,
  theme: {
    previewImage: PreviewImage.src,
  },
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Basic theme with multiple color schemes.`,
  previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsThemePluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getLayout,
  meta,
} satisfies ClubsFunctionThemePlugin
