/**
 * WARN: Don't publish as a npm because this package is only working on clubsx.
 */
import type { Product, Products } from '@constants/products'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Id } from './id.astro'
import { solidityPacked } from 'ethers'
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
    collectionId: '8c3350a1-d877-4357-ba75-4c7e7a91412b',
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
  DevprotocolClubsPluginNft = 'devprotocol:clubs:plugin:nft',
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, chainId, rpcUrl, propertyAddress, options: configOptions = [] },
  { getPluginConfigById },
) => {
  const importFrom = options.find((opt) => opt.key === 'importFrom')
    ?.value as UndefinedOr<string[]>
  const products = (importFrom ?? [])
    .map((plugin) => {
      switch (plugin) {
        case SupportedPlugins.DevprotocolClubsPluginNft:
          const [plg] = getPluginConfigById(
            SupportedPlugins.DevprotocolClubsPluginNft,
          )
          const products = plg?.options.find((x) => x.key === 'products')
            ?.value as UndefinedOr<Products>
          return products?.map((p) => p) // do not format
        default:
          return undefined
      }
    })
    .flat()
    .filter((x) => typeof x !== 'undefined') as Product[]

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

  console.log({ products })

  // const products = whenDefinedAll(
  //   [_products, priceOverrides],
  //   ([prods, overrides]) =>
  //     prods
  //       .map((prod) => {
  //         const override = overrides.find((x) => x.id === prod.id)
  //         return override
  //           ? {
  //               ...prod,
  //               currency: override.currency as any,
  //               price: override.price,
  //               purchaseLink: override.purchaseLink,
  //             }
  //           : undefined
  //       })
  //       .filter((x) => x) as ExtendedProducts,
  // )

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
        ...products.map((product) => ({
          paths: ['fiat', product.id],
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

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:plugin:fiat',
  displayName: 'FIAT',
  category: ClubsPluginCategory.Monetization,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
