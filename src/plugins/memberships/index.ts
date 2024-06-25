import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as AdminNew } from './admin-new.astro'
import { default as AdminEdit } from './admin-id.astro'
import { default as SyncModal } from './SyncModal.astro'
import { default as OpenModalButton } from './OpenModalButton.astro'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { ZeroAddress, randomBytes, toUtf8Bytes } from 'ethers'
import type { DraftOptions } from '@constants/draft'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/memberships-1.jpg'
import Preview2 from './assets/memberships-2.jpg'
import Preview3 from './assets/memberships-3.jpg'
import {
  PAYMENT_TYPE_INSTANT_FEE,
  PAYMENT_TYPE_STAKE_FEE,
} from '@constants/memberships'

export type Membership = {
  id: string
  name: string
  description: string
  price?: number
  currency?: 'USDC' | 'DEV' | 'ETH' | 'MATIC'
  imageSrc: string
  payload: Uint8Array | string
  fee?: {
    percentage: number
    beneficiary: string
  }
  deprecated?: boolean
  paymentType?: 'instant' | 'stake' | 'custom'
  accessControl?: {
    url: string
    description: string
  }
}

export type UnpricedMembership = Omit<Membership, 'price' | 'currency'>
export type PricedMembership = UnpricedMembership & {
  price: NonNullable<Membership['price']>
  currency: NonNullable<Membership['currency']>
}

const presets: Membership[] = [
  {
    id: 'preset-creator',
    name: `My Club`,
    imageSrc: 'https://i.imgur.com/UrRTtfG.jpg',
    currency: 'USDC',
    price: 50,
    description: `Lorem insum.`,
    payload: toUtf8Bytes('Creator'),
    paymentType: 'instant',
    fee: {
      percentage: PAYMENT_TYPE_INSTANT_FEE,
      beneficiary: ZeroAddress,
    },
  },
  {
    id: 'preset-business',
    name: `Visitor Pass`,
    imageSrc: 'https://i.imgur.com/C5ot1Sg.jpg',
    currency: 'USDC',
    price: 120,
    description: `Lorem insum.`,
    payload: toUtf8Bytes('Business'),
    paymentType: 'instant',
    fee: {
      percentage: PAYMENT_TYPE_INSTANT_FEE,
      beneficiary: ZeroAddress,
    },
  },
  {
    id: 'preset-public',
    name: `Project Member`,
    imageSrc: 'https://i.imgur.com/gZ8z2vN.jpg',
    currency: 'USDC',
    price: 10,
    description: `Lorem insum.`,
    payload: toUtf8Bytes('Public'),
    paymentType: 'stake',
    fee: {
      percentage: PAYMENT_TYPE_STAKE_FEE,
      beneficiary: ZeroAddress,
    },
  },
]

export const getPagePaths = (async () => []) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (
  options,
  { name, rpcUrl, propertyAddress },
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
      props: { memberships, presets, name, draftOptions: draftOptionsValue },
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
        name,
      },
    })) ?? []),
    ...(presets.map((preset) => ({
      paths: ['memberships', 'new', preset.id],
      component: AdminNew,
      props: {
        membership: { ...preset, payload: randomBytes(8) },
        memberships,
        propertyAddress,
        presets,
        draftOptions: draftOptionsValue,
        rpcUrl,
        name,
      },
    })) ?? []),
  ]
}) satisfies ClubsFunctionGetAdminPaths

export const getSlots = (async (
  options,
  { propertyAddress, rpcUrl, chainId },
  { paths, factory },
) => {
  const memberships =
    (options.find((opt) => opt.key === 'memberships')?.value as UndefinedOr<
      Membership[]
    >) ?? []

  const [path1, path2] = paths
  return factory === 'admin' && path1 === 'memberships' && path2 === undefined
    ? [
        {
          slot: 'admin:modal:content',
          component: SyncModal,
          props: {
            memberships,
            propertyAddress,
            rpcUrl,
            chainId,
          },
        },
        {
          slot: 'admin:aside:after-built-in-buttons',
          component: OpenModalButton,
        },
      ]
    : []
}) satisfies ClubsFunctionGetSlots

export const meta = {
  id: 'devprotocol:clubs:simple-memberships',
  displayName: 'Memberships',
  category: ClubsPluginCategory.Monetization,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Simplest tool for creating membership NFT.`,
  previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} satisfies ClubsFunctionPlugin
