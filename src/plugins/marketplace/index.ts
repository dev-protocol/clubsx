import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as Plugins } from './[plugin-name].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (
  _,
  { name, url }
) => {
  const redirectionCtaText: string = `Take me to ${name} homepage`
  const redirectionCtaUrl: string = url.replace('<USERS_SITE_NAME_HERE>', name)

  return [
    {
      paths: ['marketplace'],
      component: Index,
      props: { redirectionCtaUrl, redirectionCtaText },
    },
    {
      paths: ['marketplace', 'plugin-name'],
      component: Plugins,
      props: { config, showAside: false },
    },
  ]
}

export const meta: ClubsPluginMeta = {
  id: 'devprotocol:clubs:clubsx:marketplace',
  displayName: 'Marketplace',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
