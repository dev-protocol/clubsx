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
import { default as Id } from './[id].astro'
import { default as AddNavigationLink } from '@components/AddNavigationLink/AddNavigationLink.astro'
import type { NavLink } from '@constants/navLink'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/quests-1.jpg'

const questParams = ['quest_starter', 'quest_stake_100', 'quest_stake_500']

export const getPagePaths = (async (options, _) => [
  { paths: ['quests'], component: Index, props: { options } },
  ...questParams.map((param) => ({
    paths: ['quests', param],
    component: Id,
  })),
]) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (options) => [
  {
    paths: ['quests'],
    component: Admin,
    props: {
      options,
    },
  },
]) satisfies ClubsFunctionGetAdminPaths

export const getSlots = (async (_, config, { paths, factory }) => {
  const [path] = paths
  return factory === 'admin' && path === 'quests'
    ? [
        {
          slot: 'admin:aside:after-built-in-buttons',
          component: AddNavigationLink,
          props: {
            forAddNavigationLink: {
              config,
              label: `Add 'Quests' to the menu`,
              link: { display: 'Quests', path: '/quests' } as NavLink,
            },
          },
        },
      ]
    : []
}) satisfies ClubsFunctionGetSlots
export const meta = {
  id: 'devprotocol:clubs:plugin:quests',
  displayName: 'Quests',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Add Dework link.`,
  previewImages: [Preview1.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} satisfies ClubsFunctionPlugin
