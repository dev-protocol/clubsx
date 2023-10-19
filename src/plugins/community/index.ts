import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionGetSlots,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Admin } from './admin.astro'
import { default as AddNavigationLink } from '@components/AddNavigationLink/AddNavigationLink.astro'
import type { NavLink } from '@constants/navLink'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/community-1.jpg'

export const getPagePaths = (async (options, { name }) => [
  { paths: ['community'], component: Index, props: { name, options } },
]) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (options) => [
  {
    paths: ['community'],
    component: Admin,
    props: {
      options,
    },
  },
]) satisfies ClubsFunctionGetAdminPaths

export const getSlots = (async (_, config, { paths, factory }) => {
  const [path] = paths
  return factory === 'admin' && path === 'community'
    ? [
        {
          slot: 'admin:aside:after-built-in-buttons',
          component: AddNavigationLink,
          props: {
            forAddNavigationLink: {
              config,
              label: `Add 'Community' to the menu`,
              link: { display: 'Community', path: '/community' } as NavLink,
            },
          },
        },
      ]
    : []
}) satisfies ClubsFunctionGetSlots

export const meta = {
  id: 'devprotocol:clubs:plugin:community',
  displayName: 'Discord',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Add guild.xyz link.`,
  previewImages: [Preview1.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} satisfies ClubsFunctionPlugin
