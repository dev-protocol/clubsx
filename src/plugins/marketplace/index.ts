import { type InstallablePlugins, installablePlugins } from '@constants/plugins'
import {
  type ClubsFunctionGetAdminPaths,
  type ClubsFunctionGetPagePaths,
  type ClubsFunctionPlugin,
  ClubsPluginCategory,
  type ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as Plugin } from './[pluginId].astro'

export const getPagePaths = (async () => []) satisfies ClubsFunctionGetPagePaths

export const getAdminPaths = (async (_, config) => {
  const allInstallablePlugins: InstallablePlugins[] = installablePlugins

  return [
    {
      paths: ['marketplace'],
      component: Admin,
      props: { config, showAside: false, allInstallablePlugins },
    },
    ...allInstallablePlugins.map((plugin) => ({
      paths: ['marketplace', plugin.id],
      component: Plugin,
      props: { config, showAside: false, plugin },
    })),
  ]
}) satisfies ClubsFunctionGetAdminPaths

export const meta = {
  id: 'devprotocol:clubs:clubsx:marketplace',
  displayName: 'Marketplace',
  category: ClubsPluginCategory.Uncategorized,
} satisfies ClubsPluginMeta

export default {
  getPagePaths,
  getAdminPaths,
  meta,
} satisfies ClubsFunctionPlugin
