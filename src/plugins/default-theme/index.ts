import type { UndefinedOr } from '@devprotocol/util-ts'
import type {
  ClubsConfiguration,
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetLayout,
  ClubsFunctionGetPagePaths,
  ClubsFunctionThemePlugin,
  ClubsPluginOptions,
  ClubsThemePluginMeta,
  ClubsPluginOption,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Layout } from './layouts/Default.astro'
import { default as Index } from './pages/index.astro'
import { default as Admin } from './admin.astro'
import type { HomeConfig } from '../../constants/homeConfig'
import type { NavLink } from '@constants/navLink'
import type { Membership } from '@plugins/memberships'

import membershipOpt1 from '@assets/membership-opt-1.png'
import membershipOpt2 from '@assets/membership-opt-2.png'
import membershipOpt3 from '@assets/membership-opt-3.png'
import { utils } from 'ethers'

export const colorPresets = {
  Purple: {
    bg: 'rgba(131, 138, 176, 1)',
    backgroundGradient: ['rgba(204, 0, 255, 0.2)', 'rgba(204, 0, 255, 0)'],
  },
  Grey: {
    bg: 'rgba(173, 173, 173, 1)',
  },
  Black: {
    bg: 'rgba(29, 36, 38, 1)',
  },
  Brown: {
    bg: 'rgba(68, 59, 45, 1)',
    backgroundGradient: ['rgba(255, 201, 119, 0.2)', 'rgba(255, 201, 119, 0)'],
  },
  Stone: {
    bg: 'rgba(96, 119, 124, 1)',
    backgroundGradient: ['rgba(196, 196, 196, 0.5)', 'rgba(196, 196, 196, 0)'],
  },
  Matcha: {
    bg: 'rgba(63, 78, 38, 1)',
  },
}

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

export type GlobalConfigValue = {
  bg?: string
  backgroundGradient?: [string, string]
}

export type HomeConfigValue = {
  hero?: {
    image?: string
  }
  description?: string
  body?: string
}
// TODO: THIS CONFIGURATION IS JUST FOR DEVELOPMENT
const options = [
  {
    key: 'globalConfig',
    value: colorPresets.Purple as GlobalConfigValue,
  },
  {
    key: 'homeConfig',
    value: {
      hero: {
        image:
          'https://images.unsplash.com/photo-1673422627994-ba82ef264160?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340',
      },
      description: lorem,
      body: `https://www.youtube.com/watch?v=EK9MUwep4pY\n\n ${lorem}\n ### Heading\n 2 ${lorem}`,
    } as HomeConfigValue,
  },
]
// TODO: THIS CONFIGURATION IS JUST FOR DEVELOPMENT
const config: ClubsConfiguration = {
  name: 'MyWaves',
  twitterHandle: '@aggre_',
  description: '',
  url: '',
  propertyAddress: '0x70a8B9a4B2d407a542c205adBbEA38289c3285eB',
  chainId: 80001,
  rpcUrl:
    'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920',
  adminRolePoints: 0,
  options: [
    {
      key: 'ogp',
      value: {
        image:
          'https://images.unsplash.com/photo-1674614076460-2e6a391cd5ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
      },
    },
    {
      key: 'headerLinks',
      value: [
        {
          display: 'Kougenji',
          path: 'https://kougenji.clubs.stakes.social/',
        },
      ],
    },
    {
      key: 'socialLinks',
      value: [
        {
          display: 'Twitter',
          path: '#',
          kind: 'twitter',
        },
        {
          display: 'Discord',
          path: '#',
          kind: 'discord',
        },
      ],
    },
    {
      key: 'navigationLinks',
      value: [
        {
          display: 'Community',
          path: '/community',
        },
        {
          display: 'Perks',
          path: '/perks',
        },
        {
          display: 'Quests',
          path: '#',
          enable: false,
        },
        {
          display: 'Updates',
          path: '#',
          enable: false,
        },
        {
          display: 'Vote',
          path: '#',
          enable: false,
        },
      ],
    },
    {
      key: 'avatarImgSrc',
      value:
        'https://images.unsplash.com/photo-1643631961497-238f8c59d171?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwcm9maWxlLWxpa2VkfDd8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=700&q=60',
    },
  ],
  plugins: [
    {
      name: 'defaultTheme',
      enable: true,
      options: options,
    },
    {
      name: 'memberships',
      options: [
        {
          key: 'memberships',
          value: [
            {
              id: 'preset-casual',
              name: 'Casual',
              imageSrc: membershipOpt1,
              currency: 'ETH',
              price: 0.003,
              description: 'lorem ipsum',
              payload: utils.toUtf8Bytes('Casual'),
            },
            {
              id: 'preset-luxury',
              name: 'Luxury',
              imageSrc: membershipOpt2,
              currency: 'ETH',
              price: 1,
              description: 'lorem ipsum',
              payload: utils.toUtf8Bytes('Luxury'),
            },
            {
              id: 'preset-edge',
              name: 'Edge',
              imageSrc: membershipOpt3,
              currency: 'ETH',
              price: 0.5,
              description: 'lorem ipsum',
              payload: utils.toUtf8Bytes('Edge'),
            },
          ],
        },
      ],
    },
  ],
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (_, __) => {
  const { name, propertyAddress, rpcUrl, chainId } = config

  const memberships = config.plugins
    .find((plg) => plg.name === 'memberships')
    ?.options.find((opt) => opt.key === 'memberships')?.value as UndefinedOr<
    Membership[]
  >

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
    props: { options, config, colorPresets },
  },
]

export const getLayout: ClubsFunctionGetLayout = async (_, __) => {
  const globalConfig = options.find((opt) => opt.key === 'globalConfig')?.value
  const homeConfig = options.find((opt) => opt.key === 'homeConfig')?.value
  return {
    layout: Layout,
    props: { config, homeConfig, globalConfig },
  }
}

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
