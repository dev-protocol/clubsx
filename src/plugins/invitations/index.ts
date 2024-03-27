import type {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetApiPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginMeta,
  Membership,
} from '@devprotocol/clubs-core'
import { ClubsPluginCategory, SinglePath } from '@devprotocol/clubs-core'
import { default as Icon } from './assets/icon.svg' // @todo: replace this icon
import { Content as Readme } from './README.md'
// import Preview1 from './assets/default-theme-1.jpg'
// import Preview2 from './assets/default-theme-2.jpg'
// import Preview3 from './assets/default-theme-3.jpg'
import getInvitationsId from './handlers/get-invitations-id'
import getInvitationsCheck from './handlers/get-invitations-check'
import claimInvitation from './handlers/claim-invitation'
import postInvitation from './handlers/post-invitation'
import { default as Id } from './[id].astro'
import type { UndefinedOr } from '@devprotocol/util-ts'

export const getPagePaths = (async (
  options,
  config,
  { getPluginConfigById },
) => {
  const [membershipsPlugin] = getPluginConfigById(
    'devprotocol:clubs:simple-memberships',
  )
  const memberships = membershipsPlugin?.options?.find(
    ({ key }) => key === 'memberships',
  )?.value as UndefinedOr<readonly Membership[]>

  return [
    {
      paths: ['invitations', SinglePath],
      component: Id,
      props: { memberships, baseUrl: config.url },
    },
  ]
}) satisfies ClubsFunctionGetPagePaths

export const getApiPaths = (async (
  options,
  config,
  { getPluginConfigById },
) => {
  return [
    {
      paths: ['invitations', SinglePath],
      method: 'GET',
      handler: getInvitationsId,
    },
    {
      paths: ['invitations', 'check', SinglePath],
      method: 'GET',
      handler: getInvitationsCheck,
    },
    {
      paths: ['invitations'],
      method: 'POST',
      handler: postInvitation(config),
    },
    {
      paths: ['invitations', 'claim'],
      method: 'POST',
      handler: claimInvitation({
        rpcUrl: config.rpcUrl,
        chainId: config.chainId,
        property: config.propertyAddress,
        getPluginConfigById,
      }),
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
  // previewImages: [Preview1.src, Preview2.src, Preview3.src],
  readme: Readme,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getApiPaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
