import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as AdminNew } from './admin-new.astro'
import { UndefinedOr } from '@devprotocol/util-ts'
import membershipOpt1 from '@assets/membership-opt-1.png'
import membershipOpt2 from '@assets/membership-opt-2.png'
import membershipOpt3 from '@assets/membership-opt-3.png'
import { utils } from 'ethers'

export type Membership = {
  id: string
  name: string
  description: string
  price: number
  currency: 'DEV' | 'ETH'
  imageSrc: string
  payload: Uint8Array
  fee?: {
    percentage: number
    beneficiary: string
  }
}

const presets: Membership[] = [
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
]

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (options) => {
  const memberships =
    (options.find((opt) => opt.key === 'memberships')?.value as UndefinedOr<
      Membership[]
    >) ?? []

  return [
    {
      paths: ['memberships'],
      component: Admin,
      props: { memberships, presets },
    },
    ...(memberships?.map((membership) => ({
      paths: ['memberships', membership.id],
      component: Admin,
      props: { membership, memberships },
    })) ?? []),
    ...(presets.map((membership) => ({
      paths: ['memberships', 'new', membership.id],
      component: AdminNew,
      props: { membership, memberships, presets },
    })) ?? []),
  ]
}

export const meta: ClubsPluginMeta = {
  displayName: 'Memberships',
  category: ClubsPluginCategory.Monetization,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
