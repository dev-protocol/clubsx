import type { Products } from '@constants/products'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async (
  options,
  config
) => {
  let products: Products | undefined = []
  let coverImgSrc: string = ''
  let title: string = ''
  let description: string = ''
  let avatarImgSrc: string = ''

  for (const option of config.options || []) {
    if (option.key === 'avatarImgSrc') {
      avatarImgSrc = option?.value as string
      break
    }
  }

  for (const option of options) {
    if (option.key === 'products') {
      products = option?.value as UndefinedOr<Products>
      continue
    }

    if (option.key === 'coverImgSrc') {
      coverImgSrc = option?.value as string
      continue
    }

    if (option.key === 'title') {
      title = option?.value as string
      continue
    }

    if (option.key === 'description') {
      description = option?.value as string
      continue
    }
  }

  return products
    ? [
        {
          paths: ['nft'],
          component: Index,
          props: {
            products,
            coverImgSrc,
            title,
            description,
            avatarImgSrc,
            projectName: config.name,
          },
        },
      ]
    : []
}

export const getAdminPaths: ClubsFunctionGetAdminPaths = async () => []

export const meta: ClubsPluginMeta = { displayName: 'NFT' }

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
