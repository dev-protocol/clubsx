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
import { default as Icon } from '@assets/CaseStudyMedia1.png'
import { default as Readme } from './README.md'

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
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:community',
  displayName: 'Community',
  category: ClubsPluginCategory.Growth,
  icon: Icon,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
  previewImages: [Icon, Icon, Icon],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} as ClubsFunctionPlugin
