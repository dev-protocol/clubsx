import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as AdminNew } from './admin-new.astro'
import { default as AdminEdit } from './admin-id.astro'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { utils } from 'ethers'
import type { DraftOptions } from '@constants/draft'

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
    imageSrc: 'https://i.imgur.com/80cN1P3.png',
    currency: 'ETH',
    price: 0.003,
    description: 'lorem ipsum',
    payload: utils.toUtf8Bytes('Casual'),
  },
  {
    id: 'preset-luxury',
    name: 'Luxury',
    imageSrc: 'https://i.imgur.com/eKOWcfP.png',
    currency: 'ETH',
    price: 1,
    description: 'lorem ipsum',
    payload: utils.toUtf8Bytes('Luxury'),
  },
  {
    id: 'preset-edge',
    name: 'Edge',
    imageSrc: 'https://i.imgur.com/m1v5j6g.png',
    currency: 'ETH',
    price: 0.5,
    description: 'lorem ipsum',
    payload: utils.toUtf8Bytes('Edge'),
  },
]

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  { rpcUrl, propertyAddress }
) => {
  const memberships =
    (options.find((opt) => opt.key === 'memberships')?.value as UndefinedOr<
      Membership[]
    >) ?? []

  const draftOptions = options?.find((opt) => opt.key === '__draft')
  const draftOptionsValue =
    draftOptions && (draftOptions.value as DraftOptions['value'])

  return [
    {
      paths: ['memberships'],
      component: Admin,
      props: { memberships, presets, draftOptions: draftOptionsValue },
    },
    ...(memberships?.map((membership) => ({
      paths: ['memberships', membership.id],

      component: AdminEdit,
      props: {
        membership,
        memberships,
        propertyAddress,
        draftOptions: draftOptionsValue,
        rpcUrl,
      },
    })) ?? []),
    ...(presets.map((membership) => ({
      paths: ['memberships', 'new', membership.id],
      component: AdminNew,
      props: {
        membership,
        memberships,
        propertyAddress,
        presets,
        draftOptions: draftOptionsValue,
        rpcUrl,
      },
    })) ?? []),
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:simple-memberships',
  displayName: 'Memberships',
  category: ClubsPluginCategory.Monetization,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
