import { Products } from '@constants/products'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { UndefinedOr } from '@devprotocol/util-ts'
import { default as Index } from './index.astro'

export type PriceOverrides = {
  id: string
  currency: string
  price: number
  purchaseLink: string
}[]

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  { name, options: configOptions = [] }
) => {
  const products = options.find((opt) => opt.key === 'products')
    ?.value as UndefinedOr<Products>
  const priceOverrides = options.find((opt) => opt.key === 'priceOverrides')
    ?.value as UndefinedOr<PriceOverrides>
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

  return products && priceOverrides
    ? [
        {
          paths: [...slug],
          props: {
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
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'FIAT' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
