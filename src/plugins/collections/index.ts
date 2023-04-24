import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/limited-number-of-items.svg'
import Preview2 from './assets/time-limited-collection.svg'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => {
  return [
    {
      paths: ['collections'],
      component: Admin,
      props: {},
    },
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:collections',
  displayName: 'Collections',
  category: ClubsPluginCategory.Monetization,
  icon: Icon,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Dummy is a content generation toolkit designed to make the development.`,
  previewImages: [Preview1, Preview2],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
