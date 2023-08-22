import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
  ClubsPluginOption,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as AdminNew } from './admin-new.astro'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/limited-number-of-items.svg'
import Preview2 from './assets/time-limited-collection.svg'
import type { UndefinedOr } from '@devprotocol/util-ts'

export type Membership = {
  id: string
  name: string
  description: string
  price: number
  currency: 'DEV' | 'ETH' | 'USDC'
  imageSrc: string
  payload: Uint8Array
  fee?: {
    percentage: number
    beneficiary: string
  }
  deprecated?: boolean
  slots?: {
    startTime: number
    endTime?: number
    memberCount?: number
  }
}

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  { name },
  { getPluginConfigById }
) => {
  const [membershipConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships'
  )

  const memberships =
    (membershipConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'memberships'
    )?.value as UndefinedOr<Membership[]>) ?? []

  return [
    {
      paths: ['collections'],
      component: Admin,
      props: { memberships },
    },
    {
      paths: ['collections', 'new'],
      component: AdminNew,
      props: { isTimeLimitedCollection: false, memberships, name },
    },
    {
      paths: ['collections', 'new', 'time-limited-collection'],
      component: AdminNew,
      props: { isTimeLimitedCollection: true, memberships, name },
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
