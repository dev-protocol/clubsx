import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from './index.astro'
import { default as Plugins } from './plugins.astro'
import { default as Overview } from './overview.astro'
import { default as Marketplace } from '../../pages/coming-soon.astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (_, config) => [
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
    paths: ['marketplace'],
    component: Marketplace,
    props: {
      redirectionCtaUrl: config.url.replace(
        '<USERS_SITE_NAME_HERE>',
        config.name
      ),
      redirectionCtaText: `Take me to ${config.name} homepage`,
    },
  },
]

export const meta: ClubsPluginMeta = {
  displayName: 'Example',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
