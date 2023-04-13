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
import { default as Modal } from './modal.astro'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { utils } from 'ethers'
import type { DraftOptions } from '@constants/draft'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/memberships-1.jpg'
import Preview2 from './assets/memberships-2.jpg'
import Preview3 from './assets/memberships-3.jpg'

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
  deprecated?: boolean
}

const presets: Membership[] = [
  {
    id: 'preset-community',
    name: `Alice's`,
    imageSrc: 'https://i.imgur.com/sznqcmL.png',
    currency: 'ETH',
    price: 0.005,
    description: `Always be with Alice! This membership gives you access to an exclusive Discord, where you can participate in monthly community hours and view hand-drawn illustrations and posts.`,
    payload: utils.toUtf8Bytes('Community'),
  },
  {
    id: 'preset-team',
    name: `Awesome-band Contributor`,
    imageSrc: 'https://i.imgur.com/YaNNZ2F.png',
    currency: 'ETH',
    price: 0.005,
    description: `Want to be an Awesome-band contributor? This is it! Help organize events, manage co-creation projects with external collaborators, and see some of the special productions that only the band team can see.`,
    payload: utils.toUtf8Bytes('Team'),
  },
  {
    id: 'preset-dao',
    name: `XYZ DAO Member`,
    imageSrc: 'https://i.imgur.com/wwJ2rBf.png',
    currency: 'ETH',
    price: 0.005,
    description: `As a core member of XYZ, a DAO pushing seismic waveform research, join the team that manages the measurement nodes, reporting data, and organization.`,
    payload: utils.toUtf8Bytes('DAO'),
  },
]

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  { name, rpcUrl, propertyAddress }
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
        membership: { ...preset, payload: utils.randomBytes(8) },
        memberships,
        propertyAddress,
        presets,
        draftOptions: draftOptionsValue,
        rpcUrl,
        name,
      },
    })) ?? []),
  ]
}

export const getSlots: ClubsFunctionGetSlots = async (
  _,
  __,
  { paths, factory }
) => {
  const [path1, path2] = paths
  return factory === 'admin' && path1 === 'memberships' && path2
    ? [
        {
          slot: 'admin:modal:content',
          component: Modal,
        },
      ]
    : []
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:simple-memberships',
  displayName: 'Memberships',
  category: ClubsPluginCategory.Monetization,
  icon: Icon,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Simplest tool for creating membership NFT.`,
  previewImages: [Preview1, Preview2, Preview3],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} as ClubsFunctionPlugin
