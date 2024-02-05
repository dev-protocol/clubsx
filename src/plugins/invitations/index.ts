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
import { aperture } from 'ramda'
import { withCheckingIndex, getDefaultClient } from './redis'
import { Index, schema, uuidToQuery, type Invitation } from './redis-schema'
import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'

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
        const [, givenId] =
          aperture(2, req.url.pathname.split('/')).find(
            ([p]) => p === 'invitations',
          ) ?? []

        const id =
          whenDefined(givenId, (_id) => _id) ?? new Error('ID is required')

        // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
        const client = await withCheckingIndex(getDefaultClient).catch(
          (err) => err as Error,
        )

        // Try to fetch the mapped invitation.
        const data = await whenNotErrorAll([id, client], ([_id, _client]) =>
          _client.ft.search(
            Index,
            `@${schema['$.id'].AS}:{${uuidToQuery(_id)}}`,
            {
              LIMIT: {
                from: 0,
                size: 1,
              },
            },
          ),
        )

        const res = whenNotError(
          data,
          (d) =>
            (d.documents.find((x) => x.value)
              ?.value as UndefinedOr<Invitation>) ??
            new Error('ID is not found.'),
        )

        return new Response(JSON.stringify(res), {
          status: isNotError(res) ? 200 : 400,
        })
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
