import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import type { Membership } from '@plugins/memberships'
import type { UndefinedOr } from '@devprotocol/util-ts'

import { default as Index } from './index.astro'
import { default as Funds } from './funds.astro'
import { default as Plugins } from './plugins.astro'
import { default as Overview } from './overview.astro'

export const getPagePaths = (async () => []) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (options, config) => {
  const membersihpPlugin = config.plugins.find(
    (plg) => plg.id === 'devprotocol:clubs:simple-memberships',
  )
  const memberships =
    (membersihpPlugin?.options.find((opt) => opt.key === 'memberships')
      ?.value as UndefinedOr<Membership[]>) ?? []

  const vaultAddress = config.options?.find((option) => option.key === 'vault')
    ?.value as UndefinedOr<string>

  return [
    {
      paths: ['general'],
      component: Index,
      props: { config },
    },
    {
      paths: ['plugins'],
      component: Plugins,
      props: {},
    },
    {
      paths: ['overview'],
      component: Overview,
      props: { propertyAddress: config.propertyAddress, rpcUrl: config.rpcUrl },
    },
    {
      paths: [''],
      component: Overview,
      props: { propertyAddress: config.propertyAddress, rpcUrl: config.rpcUrl },
    },
    {
      paths: ['funds'],
      component: Funds,
      props: {
        memberships,
        propertyAddress: config.propertyAddress,
        rpcUrl: config.rpcUrl,
        chainId: config.chainId,
        vaultAddress,
      },
    },
  ]
}) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'clubs-core:admin',
  displayName: 'Example',
  category: ClubsPluginCategory.Uncategorized,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
