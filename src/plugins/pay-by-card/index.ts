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
import Index from './index.astro'
import Id from './id.astro'
import Slot from './slot.astro'
import Result from './result.astro'
import SlotCurrencyOption from './slot-currency-option.astro'
import { solidityPacked } from 'ethers'
import type { UndefinedOr } from '@devprotocol/util-ts'
import { bytes32Hex } from '@fixtures/data/hexlify'
import type { InjectedTiers } from '@constants/tier'
import { getItems } from './utils/getItems'
import type { CurrencyOption } from '@constants/currencyOption'
import Icon from './images/Icon.png'
import Screenshot1 from './images/pay-by-card-1.jpg'
import Screenshot2 from './images/pay-by-card-2.jpg'
import Readme from './readme/index.astro'

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
  utils,
) => {
  const products = getItems(utils)

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
          paths: ['fiat', bytes32Hex(product.payload)],
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

export const getSlots: ClubsFunctionGetSlots = async (
  _,
  __,
  { factory, ...utils },
) => {
  const products = getItems(utils)
  const tiers: InjectedTiers = products.map((item) => ({
    ...item,
    currency: 'USD + fee' as unknown as CurrencyOption,
    title: item.name,
    amount: item.price,
    badgeImageSrc: item.imageSrc,
    badgeImageDescription: item.description,
    checkoutUrl: `/fiat/${bytes32Hex(item.payload)}`,
  }))

  return factory === 'page'
    ? [
        {
          slot: 'checkout:after:transaction-form',
          component: Slot,
        },
        {
          slot: 'join:currency:option',
          component: SlotCurrencyOption,
          props: { injectedTiers: tiers },
        },
      ]
    : []
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:pay-by-card',
  displayName: 'Pay By Card - Crossmint',
  category: ClubsPluginCategory.Monetization,
  icon: Icon.src,
  description: 'Add USD payments by Crossmint.',
  previewImages: [Screenshot1.src, Screenshot2.src],
  readme: Readme,
}

export default {
  getPagePaths,
  getAdminPaths,
  getSlots,
  meta,
} as ClubsFunctionPlugin
