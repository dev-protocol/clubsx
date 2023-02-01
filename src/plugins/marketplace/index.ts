import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Index } from '../../pages/coming-soon.astro'

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
  ]
}

export const meta: ClubsPluginMeta = {
  displayName: 'Marketplace',
  category: ClubsPluginCategory.Uncategorized,
}

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} as ClubsFunctionPlugin
