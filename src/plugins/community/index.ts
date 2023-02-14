import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { default as AddNavigationLink } from '@components/AddNavigationLink/AddNavigationLink.astro'
import type { NavLink } from '@constants/navLink'

export const getPagePaths: ClubsFunctionGetPagePaths = async (_, { name }) => [
  { paths: ['community'], component: Index, props: { name } },
]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  config
) => [
  {
    paths: ['community'],
    component: Admin,
    props: {
      options,
      forAddNavigationLink: {
        config,
        label: `Add 'Community' to the menu`,
        link: { display: 'Community', path: '/community' } as NavLink,
      },
    },
    slots: {
      'aside:after-built-in-buttons': AddNavigationLink,
    },
  },
]

export const meta: ClubsPluginMeta = {
  displayName: 'Community',
  category: ClubsPluginCategory.Growth,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
