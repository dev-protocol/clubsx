import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetApiPaths,
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
import Checkout from './checkout.astro'
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
import { JsonRpcProvider } from 'ethers'
import { bytes32Hex } from '@devprotocol/clubs-core'
import { checkMemberships } from '@fixtures/utility.ts'

export type CollectionMembership = Membership & {
  memberCount?: number
}

export type Collection = {
  id: string
  name: string
  imageSrc: string
  status: 'Draft' | 'Published'
  isTimeLimitedCollection: boolean
  endTime?: number
  description: string
  memberships: CollectionMembership[]
  requiredMemberships?: string[]
}
export const getApiPaths = (async (
  options,
  config,
  { getPluginConfigById },
) => {
  const { propertyAddress, rpcUrl } = config
  const provider = new JsonRpcProvider(rpcUrl)
  const collections =
    (options.find((opt: ClubsPluginOption) => opt.key === 'collections')
      ?.value as UndefinedOr<Collection[]>) ?? []

  const [existingMembershipsConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const existingMemberships =
    (existingMembershipsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'memberships',
    )?.value as UndefinedOr<Membership[]>) ?? []

  return collections.map(
    (collection) =>
      ({
        paths: ['verification', collection.id],
        method: 'GET',
        handler: async ({ request }) => {
          const requiredPayload = new Set(
            collection.requiredMemberships?.map((reqMem) =>
              bytes32Hex(reqMem),
            ) || [],
          )
          const requiredMemberships = existingMemberships.filter((mem) =>
            requiredPayload.has(bytes32Hex(mem.payload)),
          )

          const url = new URL(request.url)
          const account = url.searchParams.get('account')
          let test = false
          try {
            test = await checkMemberships(
              provider,
              propertyAddress,
              requiredMemberships,
              account ?? ZeroAddress,
            )
          } catch (e) {
            console.log(e)
            if (requiredMemberships.length === 0) {
              test = true
            } else {
              return new Response('0')
            }
          }
          const responseText = test ? '1' : '0'
          return new Response(responseText)
        },
      }) ?? [],
  )
}) satisfies ClubsFunctionGetApiPaths

export const getSlots = (async (
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
}) satisfies ClubsFunctionGetSlots

export const getPagePaths = (async (
  options,
  { name, rpcUrl, propertyAddress },
  { getPluginConfigById },
) => {
  const [existingMembershipsConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )

  const [collectionsConfig] = getPluginConfigById(
    'devprotocol:clubs:collections',
  )

  const existingMemberships =
    (existingMembershipsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'memberships',
    )?.value as UndefinedOr<Membership[]>) ?? []

  const collections =
    (collectionsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'collections',
    )?.value as UndefinedOr<Collection[]>) ?? []

  return [
    ...(collections.map((collection) => ({
      paths: ['collections', collection.id],
      component: Id,
      props: { collection, name, rpcUrl, propertyAddress, existingMemberships },
    })) ?? []),
    ...(collections.flatMap((collection) =>
      collection.memberships.map((membership) => ({
        paths: ['collections', 'checkout', bytes32Hex(membership.payload)],
        component: Checkout,
        props: { collections, rpcUrl, collection, membership },
      })),
    ) ?? []),
    {
      paths: ['collections'],
      component: Index,
      props: { collections },
    },
  ]
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (
  options,
  { name, rpcUrl, propertyAddress },
  { getPluginConfigById },
) => {
  const [existingMembershipsConfig] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )

  const [collectionsConfig] = getPluginConfigById(
    'devprotocol:clubs:collections',
  )

  const presetTimeCollection: Collection = {
    id: 'preset-time-collection',
    name: 'My First Time Limited Collection',
    imageSrc: '',
    description: 'This is a time-limited collection.',
    isTimeLimitedCollection: true,
    status: 'Draft',
    endTime: 0,
    memberships: [],
  }

  const presetMemberCollection: Collection = {
    id: 'preset-member-collection',
    name: 'My First Quantity Limited Collection',
    imageSrc: '',
    description: 'This is a quantity-limited collection.',
    isTimeLimitedCollection: false,
    status: 'Draft',
    memberships: [],
  }

  const existingMemberships =
    (existingMembershipsConfig?.options.find(
      (opt: ClubsPluginOption) => opt.key === 'memberships',
    )?.value as UndefinedOr<Membership[]>) ?? []

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
      props: {
        collection,
        collections,
        existingMemberships,
        name,
        rpcUrl,
        propertyAddress,
      },
    })) ?? []),
    ...(collections.flatMap((collection) =>
      collection.memberships.map((membership) => ({
        paths: ['collections', collection.id, membership.id],
        component: AdminEditMembership,
        props: { collections, collection, existingMemberships, membership },
      })),
    ) ?? []),
    {
      paths: ['collections', 'new'],
      component: AdminNew,
      props: {
        isTimeLimitedCollection: false,
        preset: presetMemberCollection,
        collections,
        existingMemberships,
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
        existingMemberships,
        rpcUrl,
        propertyAddress,
        name,
      },
    },
  ]
}) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:collections',
  displayName: 'Collections',
  category: ClubsPluginCategory.Monetization,
  icon: Icon.src,
  offer: {
    price: 0,
    priceCurrency: 'DEV',
  },
  description: `Dummy is a content generation toolkit designed to make the development.`,
  previewImages: [Preview1.src, Preview2.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  getApiPaths,
  meta,
  getSlots,
} satisfies ClubsFunctionPlugin
