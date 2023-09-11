import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
  ClubsPluginOption,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory } from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as AdminEdit } from './admin-id.astro'
import { default as AdminNew } from './admin-new.astro'
import { default as AdminEditMembership } from './admin-id-id.astro'
import { default as SyncModal } from './SyncModal.astro'
import { default as OpenModalButton } from './OpenModalButton.astro'
import { default as Index } from './index.astro'
import { default as Id } from './[id].astro'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/limited-number-of-items.svg'
import Preview2 from './assets/time-limited-collection.svg'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { ZeroAddress, randomBytes, toUtf8Bytes } from 'ethers'
import type { Membership } from '@plugins/memberships'
import {
  PAYMENT_TYPE_INSTANT_FEE,
  PAYMENT_TYPE_STAKE_FEE,
} from '@constants/memberships'

export type CollectionMembership = Membership & {
  memberCount?: number
}

export type Collection = {
  id: string
  name: string
  imageSrc: string
  startTime?: number
  isTimeLimitedCollection: boolean
  endTime?: number
  description: string
  memberships: CollectionMembership[]
}

export const getSlots: ClubsFunctionGetSlots = async (
  options,
  { propertyAddress, rpcUrl, chainId },
  { paths, factory },
) => {
  const collections =
    (options.find((opt: ClubsPluginOption) => opt.key === 'collections')
      ?.value as UndefinedOr<Collection[]>) ?? []

  const [path1, path2] = paths
  return factory == 'admin' && path1 === 'collections' && path2 === undefined
    ? [
        {
          slot: 'admin:modal:content',
          component: SyncModal,
          props: {
            collections,
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
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, rpcUrl, propertyAddress },
  { getPluginConfigById },
) => {
  const [collectionsConfig] = getPluginConfigById(
    'devprotocol:clubs:collections',
  )
  const collections =
    (collectionsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'collections',
    )?.value as UndefinedOr<Collection[]>) ?? []

  return [
    ...(collections.map((collection) => ({
      paths: ['collections', collection.id],
      component: Id,
      props: { collection, name, rpcUrl, propertyAddress },
    })) ?? []),
    {
      paths: ['collections'],
      component: Index,
      props: { collections },
    },
  ]
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  options,
  { name, rpcUrl, propertyAddress },
  { getPluginConfigById },
) => {
  const [collectionsConfig] = getPluginConfigById(
    'devprotocol:clubs:collections',
  )

  const presetTimeCollection: Collection = {
    id: 'preset-time-collection',
    name: 'My First Time Limited Collection',
    imageSrc: '',
    description: 'This is a time-limited collection.',
    isTimeLimitedCollection: true,
    startTime: 0,
    endTime: 0,
    memberships: [],
  }

  const presetMemberCollection: Collection = {
    id: 'preset-member-collection',
    name: 'My First Quantity Limited Collection',
    imageSrc: '',
    description: 'This is a quantity-limited collection.',
    isTimeLimitedCollection: false,
    startTime: 0,
    memberships: [],
  }

  const collections =
    (collectionsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'collections',
    )?.value as UndefinedOr<Collection[]>) ?? []

  return [
    {
      paths: ['collections'],
      component: Admin,
      props: { collections },
    },
    ...(collections.map((collection) => ({
      paths: ['collections', collection.id],
      component: AdminEdit,
      props: { collection, collections, name, rpcUrl, propertyAddress },
    })) ?? []),
    ...(collections.flatMap((collection) =>
      collection.memberships.map((membership) => ({
        paths: ['collections', collection.id, membership.id],
        component: AdminEditMembership,
        props: { collections, collection, membership },
      })),
    ) ?? []),
    {
      paths: ['collections', 'new'],
      component: AdminNew,
      props: {
        isTimeLimitedCollection: false,
        preset: presetMemberCollection,
        collections,
        rpcUrl,
        propertyAddress,
        name,
      },
    },
    {
      paths: ['collections', 'new', 'time-limited-collection'],
      component: AdminNew,
      props: {
        isTimeLimitedCollection: true,
        preset: presetTimeCollection,
        collections,
        rpcUrl,
        propertyAddress,
        name,
      },
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
  getSlots,
} as ClubsFunctionPlugin
