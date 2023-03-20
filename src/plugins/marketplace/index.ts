import type { InstallablePlugins, PluginMeta } from '@constants/plugins'
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

export const getAdminPaths: ClubsFunctionGetAdminPaths = async (_, config) => {
  let allInstallablePlugins: InstallablePlugins[] = []

  try {
    const allPluginsResponse = await fetch(
      `http://localhost:3000/api/plugins/installablePlugins`
    ) // TODO: replace this.
    allInstallablePlugins = (await allPluginsResponse.json())?.plugins || []
  } catch (error) {
    allInstallablePlugins = []
  }

  return [
    {
      paths: ['marketplace'],
      component: Admin,
      props: { config, showAside: false },
    },
    ...allInstallablePlugins.map((plugin) => ({
      paths: ['marketplace', plugin.id],
      component: Plugins,
      props: { config, showAside: false },
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
