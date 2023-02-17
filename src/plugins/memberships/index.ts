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
import { default as Modal } from './modal.astro'
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
    id: 'preset-community',
    name: `Alice's small world`,
    imageSrc: 'https://i.imgur.com/sznqcmL.png',
    currency: 'ETH',
    price: 0.005,
    description: `This membership gives you access to an exclusive Discord, where you can participate in monthly community hours and view hand-drawn illustrations and posts.`,
    payload: utils.toUtf8Bytes('Community'),
  },
  {
    id: 'preset-team',
    name: `Awesome-band Contributor`,
    imageSrc: 'https://i.imgur.com/YaNNZ2F.png',
    currency: 'ETH',
    price: 0.005,
    description: `lorem ipsum`,
    payload: utils.toUtf8Bytes('Team'),
  },
  {
    id: 'preset-dao',
    name: `XYZ DAO Member`,
    imageSrc: 'https://i.imgur.com/wwJ2rBf.png',
    currency: 'ETH',
    price: 0.005,
    description: `lorem ipsum`,
    payload: utils.toUtf8Bytes('DAO'),
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
      slots: {
        'modal:content': Modal,
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
      slots: {
        'modal:content': Modal,
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
