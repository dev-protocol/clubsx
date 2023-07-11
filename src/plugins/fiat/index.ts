/**
 * WARN: Don't publish as a npm because this package is only working on clubsx.
 */
import type { Products } from '@constants/products'
import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, ClubsPluginSignal } from '@devprotocol/clubs-core'
import { type UndefinedOr, whenDefinedAll } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'
import { default as Id } from './id.astro'
import type { Currency } from '@crossmint/client-sdk-base'
import type { ExtendedProducts } from '@components/list/cards'

export type PriceOverrides = {
  id: string
  currency: string
  price: number
  purchaseLink: string
}[]

const CM = {
  Production: {
    projectId: '', // TODO: Replace with a production environment
    collectionId: '', // TODO: Replace with a production environment
    environment: undefined,
  },
  Staging: {
    projectId: '50a70688-7796-4dd4-8381-7cba8e18afb2', // TODO: Replace with a new project used new SwapAndStake contract
    collectionId: '1bcb5542-ac61-4673-a6b3-3266aa0db24f', // TODO: Replace with a new project used new SwapAndStake contract
    environment: 'staging',
  },
}

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, chainId, options: configOptions = [] },
) => {
  const _products = options.find((opt) => opt.key === 'products')
    ?.value as UndefinedOr<Products>
  const priceOverrides = options.find((opt) => opt.key === 'priceOverrides')
    ?.value as UndefinedOr<PriceOverrides>
  const paymentCurrency = options.find((opt) => opt.key === 'paymentCurrency')
    ?.value as UndefinedOr<Currency>
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

  const products = whenDefinedAll(
    [_products, priceOverrides],
    ([prods, overrides]) =>
      prods
        .map((prod) => {
          const override = overrides.find((x) => x.id === prod.id)
          return override
            ? {
                ...prod,
                currency: override.currency as any,
                price: override.price,
                purchaseLink: override.purchaseLink,
              }
            : undefined
        })
        .filter((x) => x) as ExtendedProducts,
  )

  return products
    ? [
        {
          paths: [...slug],
          props: {
            cm,
            paymentCurrency,
            products,
            priceOverrides,
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
          paths: ['buy-with-cc', product.id],
          props: {
            cm,
            paymentCurrency,
            product,
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
