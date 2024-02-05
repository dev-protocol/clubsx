import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetApiPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, SinglePath } from '@devprotocol/clubs-core'
import { default as Icon } from './assets/icon.svg'
import { Content as Readme } from './README.md'
import Preview1 from './assets/default-theme-1.jpg'
import Preview2 from './assets/default-theme-2.jpg'
import Preview3 from './assets/default-theme-3.jpg'
import { aperture, o } from 'ramda'
import { withCheckingIndex, getDefaultClient } from './redis'

export const getPagePaths = (async (options, config) => {
  return []
}) satisfies ClubsFunctionGetPagePaths

export const getApiPaths = (async (options, config) => {
  return [
    {
      paths: ['invitations', SinglePath],
      method: 'GET',
      handler: async (req) => {
        // Detect the passed invitation ID
        const [, id] =
          aperture(2, req.url.pathname.split('/')).find(
            ([p]) => p === 'invitations',
          ) ?? []

        // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
        const client = await withCheckingIndex(getDefaultClient)

        return new Response()
      },
    },
  ]
}) satisfies ClubsFunctionGetApiPaths

export const getAdminPaths = (async (
  options,
  config,
) => []) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:plugin:invitations',
  displayName: 'Invitations',
  category: ClubsPluginCategory.Growth,
  icon: Icon.src,
  description: `Basic theme with multiple color schemes.`,
  previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getApiPaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
