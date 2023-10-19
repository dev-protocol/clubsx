import type { Membership } from '@plugins/memberships'
import type { UndefinedOr } from '@devprotocol/util-ts'
import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'

export const getPagePaths = (async (options, config) => {
  let products: Membership[] | undefined = []

  // TODO: add default values like placeholder here.
  let coverImgSrc: string = ''
  let title: string = ''
  let description: string = ''
  let avatarImgSrc: string = ''
  let slug: string[] = ['nft']

  for (const option of config.options || []) {
    if (option.key === 'avatarImgSrc') {
      avatarImgSrc = option?.value as string
      break
    }
  }

  for (const option of options) {
    if (option.key === 'products') {
      products = option?.value as UndefinedOr<Membership[]>
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

    if (option.key === 'slug') {
      slug = option?.value as string[]
      continue
    }
  }

  return products
    ? [
        {
          paths: [...slug],
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
}) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths =
  (async () => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:nft',
  displayName: 'NFT',
  category: ClubsPluginCategory.Monetization,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
