import type { InstallablePlugins, PluginMeta } from '@constants/plugins'
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
  let allInstallablePlugins: InstallablePlugins[] = []

  try {
    const allPluginsResponse = await fetch(
      `http://localhost:3000/api/plugins/installablePlugins`
    ) // TODO: replace this.
    allInstallablePlugins = (await allPluginsResponse.json())?.plugins || []
  } catch (error) {
    allInstallablePlugins = []
  }

  const allPluginsPromise: Promise<PluginMeta>[] = allInstallablePlugins.map(
    async (plugin: InstallablePlugins) => {
      const importedPlugin: ClubsFunctionPlugin = plugin.isExternalModule
        ? await import(`${plugin.moduleNameForImport}/${plugin.entryPoint}`)
        : await import(`../${plugin.moduleNameForImport}/${plugin.entryPoint}`)

      return {
        ...importedPlugin.meta,
        added: !!config.plugins.find(
          (plg: ClubsPlugin) => plg.id === plugin.id // TODO: use plugin.id in future.
        ),
        tag: plugin.tag,
        developer: plugin.developer,
        repositoryUrl: plugin.repositoryUrl,
        clubsUrl: plugin.clubsUrl,
      }
    }
  )
  const allPlugins: PluginMeta[] = await Promise.all(allPluginsPromise)

  return [
    {
      paths: ['marketplace'],
      component: Admin,
      props: { config, showAside: false, allPlugins },
    },
    ...allPlugins.map((plugin) => ({
      paths: ['marketplace', plugin.id],
      component: Plugin,
      props: { config, showAside: true, plugin },
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
