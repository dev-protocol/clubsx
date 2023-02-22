import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { default as AddNavigationLink } from '@components/AddNavigationLink/AddNavigationLink.astro'
import type { NavLink } from '@constants/navLink'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name }
) => [{ paths: ['community'], component: Index, props: { name, options } }]

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (options) => [
  {
    paths: ['community'],
    component: Admin,
    props: {
      options,
    },
  },
]

export const getSlots: ClubsFunctionGetSlots = async (
  _,
  config,
  { paths, factory }
) => {
  const [path] = paths
  return factory === 'admin' && path === 'community'
    ? {
        'admin:aside:after-built-in-buttons': [
          {
            component: AddNavigationLink,
            props: {
              forAddNavigationLink: {
                config,
                label: `Add 'Community' to the menu`,
                link: { display: 'Community', path: '/community' } as NavLink,
              },
            },
          },
        ],
      }
    : {}
}

export const meta: ClubsPluginMeta = {
  displayName: 'Community',
  category: ClubsPluginCategory.Growth,
}

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} as ClubsFunctionPlugin
