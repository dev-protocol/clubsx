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

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  _,
  {
    name,
    description,
    twitterHandle,
    propertyAddress,
    rpcUrl,
    url,
    adminRolePoints,
  }
) => [
  {
    paths: ['general'],
    component: Index,
    props: {
      name,
      description,
      twitterHandle,
      propertyAddress,
      adminRolePoints,
    },
  },
  {
    paths: ['plugins'],
    component: Plugins,
    props: {},
  },
  {
    paths: ['overview'],
    component: Overview,
    props: { propertyAddress, rpcUrl },
  },
  {
    paths: ['marketplace'],
    component: Marketplace,
    props: {
      redirectionCtaUrl: url.replace('<USERS_SITE_NAME_HERE>', name),
      redirectionCtaText: `Take me to ${name} homepage`,
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
