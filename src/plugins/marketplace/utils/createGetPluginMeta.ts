import type {
  ClubsConfiguration,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { modules } from '../constants/modules'
import type { InstallablePlugins, PluginMeta } from '@constants/plugins'

const has = (id: string): id is keyof typeof modules => id in modules

export const createGetPluginMeta =
  (config: ClubsConfiguration) =>
  async (plugin: InstallablePlugins): Promise<PluginMeta> => {
    const importedPlugin: ClubsFunctionPlugin = plugin.planned
      ? plugin.planned
      : has(plugin.id)
      ? await modules[plugin.id]()
      : // TODO: supports unexpected situation
        (undefined as never)

    return {
      ...importedPlugin.meta,
      added: !!config.plugins.find((plg) => plg.id === plugin.id),
      tag: plugin.tag,
      developer: plugin.developer,
      repositoryUrl: plugin.repositoryUrl,
      clubsUrl: plugin.clubsUrl,
      planned: plugin.planned,
      pluginOptions: plugin.pluginOptions,
      require: plugin.require,
    }
  }
