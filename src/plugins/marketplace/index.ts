import {
  InstallablePlugins,
  PluginMeta,
  installablePlugins,
} from '@constants/plugins'
import {
  ClubsFunctionGetAdminPaths,
  ClubsFunctionGetPagePaths,
  ClubsFunctionPlugin,
  ClubsPlugin,
  ClubsPluginCategory,
  ClubsPluginMeta,
} from '@devprotocol/clubs-core'
import { default as Admin } from './admin.astro'
import { default as Plugin } from './[pluginId].astro'

export const getPagePaths: ClubsFunctionGetPagePaths = async () => []

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (_, config) => {
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
