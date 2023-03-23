import type {
  ClubsConfiguration,
  ClubsFunctionPlugin,
} from '@devprotocol/clubs-core'
import { modules } from '../constants/modules'
import type { InstallablePlugins } from '@constants/plugins'

const has = (id: string): id is keyof typeof modules => id in modules

export const createGetPluginMeta =
  (config: ClubsConfiguration) => async (plugin: InstallablePlugins) => {
    const importedPlugin: ClubsFunctionPlugin = has(plugin.id)
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
    }
  }
