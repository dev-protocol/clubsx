/**
 * WARN: Don't publish as a npm because this package is only working on clubsx.
 */
import type { Membership } from '@plugins/memberships'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionGetSlots,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './id.astro'
import { default as Slot } from './slot.astro'
import { default as Result } from './result.astro'
import { keccak256, solidityPacked } from 'ethers'
import type { UndefinedOr } from '@devprotocol/util-ts'

export type PriceOverrides = {
  id: string
  currency: string
  price: number
  purchaseLink: string
}[]

export type CMValues = {
  projectId: string
  collectionId: string
  environment?: string
  args: {
    token: string
    path: string
  }
}

const CM: Record<string, CMValues> = {
  Production: {
    projectId: '153ad47b-5d4f-4017-af84-492596b99c56',
    collectionId: '5bfe4b7b-bba8-4577-a2de-e443ea92f1d8',
    environment: undefined,
    args: {
      token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
      path: solidityPacked(
        ['address', 'uint24', 'address', 'uint24', 'address'],
        [
          '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
          '500',
          '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
          '10000',
          '0xA5577D1cec2583058A6Bd6d5DEAC44797c205701', // DEV
        ],
      ),
    },
  },
  Staging: {
    projectId: '50a70688-7796-4dd4-8381-7cba8e18afb2',
    collectionId: '1c6eb836-59b9-4cb7-810d-8a844274dd83',
    environment: 'staging',
    args: {
      token: '0xFEca406dA9727A25E71e732F9961F680059eF1F9', // USDC on Mumbai
      path: solidityPacked(
        ['address', 'uint24', 'address', 'uint24', 'address'],
        [
          '0xFEca406dA9727A25E71e732F9961F680059eF1F9', // USDC
          '10000',
          '0x3c8d6A6420C922c88577352983aFFdf7b0F977cA', // devWETH
          '10000',
          '0xcbc698ed514dF6e54932a22515d6D0C27E4DA091', // DEV
        ],
      ),
    },
  },
}

export enum SupportedPlugins {
  DevprotocolClubsSimpleMemberships = 'devprotocol:clubs:simple-memberships',
  DevprotocolClubsPluginNft = 'devprotocol:clubs:plugin:nft',
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { chainId, rpcUrl, propertyAddress, options: configOptions = [] },
  { getPluginConfigById },
) => {
  const products: Membership[] = [
    SupportedPlugins.DevprotocolClubsSimpleMemberships,
    SupportedPlugins.DevprotocolClubsPluginNft,
  ]
    .map((plugin) => {
      switch (plugin) {
        case SupportedPlugins.DevprotocolClubsSimpleMemberships:
          /**
           * Import from devprotocol:clubs:simple-memberships
           */
          const [simpleMemberships] = getPluginConfigById(
            SupportedPlugins.DevprotocolClubsSimpleMemberships,
          )
          const memberships = simpleMemberships?.options.find(
            (x) => x.key === 'memberships',
          )?.value as UndefinedOr<Membership[]>
          return memberships?.filter(
            (p) => !p.deprecated && p.currency === 'USDC',
          )

        case SupportedPlugins.DevprotocolClubsPluginNft:
          /**
           * Import from devprotocol:clubs:plugin:nft
           */
          const [nft] = getPluginConfigById(
            SupportedPlugins.DevprotocolClubsPluginNft,
          )
          const products = nft?.options.find((x) => x.key === 'products')
            ?.value as UndefinedOr<Membership[]>
          return products?.filter((p) => p.currency === 'USDC')

        default:
          return undefined
      }
    })
    .flat()
    .filter((x) => typeof x !== 'undefined') as Membership[]

  // const priceOverrides = options.find((opt) => opt.key === 'priceOverrides')
  //   ?.value as UndefinedOr<PriceOverrides>

  const slug = (options.find((opt) => opt.key === 'slug')?.value as UndefinedOr<
    string[]
  >) ?? ['fiat']

  const avatarImgSrc = configOptions.find((opt) => opt.key === 'avatarImgSrc')
    ?.value as UndefinedOr<string>
  const hero = options.find((opt) => opt.key === 'hero')?.value as UndefinedOr<{
    coverImgSrc: string
    title: string
    description: string
    projectName: string
  }>
  const title = options.find((opt) => opt.key === 'title')
    ?.value as UndefinedOr<string>

  const cm = chainId === 137 ? CM.Production : CM.Staging

  return products
    ? [
        {
          paths: [...slug],
          props: {
            products,
            hero: hero
              ? {
                  ...hero,
                  avatarImgSrc,
                }
              : undefined,
            title,
          },
          component: Index,
        },
        {
          paths: ['fiat', 'result'],
          props: { rpcUrl },
          component: Result,
        },
        ...products.map((product) => ({
          paths: ['fiat', keccak256(product.payload)],
          props: {
            cm,
            product,
            rpcUrl,
            propertyAddress,
            signals: [ClubsPluginSignal.DisplayFullPage],
          },
          component: Id,
        })),
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const getSlots: ClubsFunctionGetSlots = async (_, __, { factory }) => {
  return factory === 'page'
    ? [
        {
          slot: 'checkout:before:transaction-form',
          component: Slot,
        },
      ]
    : []
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:pay-by-card',
  displayName: 'Pay By Card',
  category: ClubsPluginCategory.Monetization,
}

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} as ClubsFunctionPlugin
