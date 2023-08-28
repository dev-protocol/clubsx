import React from 'react'
import { decode, setConfig } from '@devprotocol/clubs-core'

class AdminPlugins extends React.Component {
  constructor(props) {
    super(props)

    let decodedConfig = decode(props.clubs.encodedClubsConfiguration)
    const injectedPlugins = props.clubs.plugins

    const plugins = []
    let adminPlugin = {}
    for (const plugin of decodedConfig.plugins) {
      // Skip the admin plugin, but maintain a backup to add it later while doing setConfig in order to
      // avoid overriding it.
      if (plugin.name.toLowerCase() === 'admin') {
        // TODO: use plugin.id in future.
        adminPlugin = plugin
        continue
      }

      // Find how many plugisn match the same name and are enabled.
      const matchingInjectedPlugins = injectedPlugins.filter(
        (iP) =>
          iP.name.toLowerCase() === plugin.name.toLowerCase() && iP.enable, // TODO: use plugin.id in future.
      )
      plugins.push({
        ...plugin,
        enable: matchingInjectedPlugins.length > 0 || plugin.enable, // If length is 0, that means plugins doesn't exist or is not enabled in injection so we keep it's status as is.
      })
    }

    decodedConfig = {
      ...decodedConfig,
      plugins, // NOTE: this doesn't contain the 'admin' plugin, it has to be added back in when we are update the config in the db.
    }

    this.state = { config: decodedConfig, adminPlugin }
    this.toggleActivation = this.toggleActivation.bind(this)
  }

  toggleActivation = (pluginName) => {
    // Fail safe to avoid toggling admin plugin
    if (pluginName.toLowerCase() === 'admin') return

    this.setState((prevState) => {
      const plugins = prevState.config.plugins

      // 1. Find index of plugin.
      const index = plugins.findIndex((plugin) => plugin.name === pluginName) // TODO: use plugin.id in future.
      if (index === -1) return prevState

      // 2. Extract it's details.
      const pluginDetails = { ...plugins[index] }
      // 3. Toggle plugin.
      pluginDetails.enable = !pluginDetails.enable
      // 4. Update the toggle w.r.t all plugins.
      plugins[index] = pluginDetails
      // 5. Update the config.
      const config = {
        ...prevState.config,
        plugins: [...plugins, prevState.adminPlugin], // HERE: we have added back the admin plugin in the config.
      }
      // 6. Set config.
      setConfig(config)
      // 7. Update component state.
      return { ...prevState.config, plugins }
    })
  }

  render() {
    const toggleEnableClasses =
      'h-[56px] rounded-[999px] bg-[#040B10] p-[16px] cursor-pointer'
    const toggleDisableClasses =
      'h-[56px] rounded-[999px] b-0 p-[16px] cursor-pointer'

    return (
      <div className="relative left-[5.555%] flex w-[51.05%] flex-col items-start gap-[64px] p-0">
        <p className="font-Syne h-9 p-0 text-2xl font-bold leading-9">
          Plugins
        </p>
        {this.state.config.plugins.map((plugin, i) => (
          <div
            className="flex w-full flex-row items-center justify-between gap-[10px] p-0"
            key={i}
          >
            <p className="h-[24px] font-body text-base font-normal capitalize leading-6">
              {
                plugin.name // TODO: use plugin.id in future.
              }
            </p>
            <div className="flex h-[68px] flex-row items-center justify-start gap-[16px] rounded-[99px] border-[3px] border-[##040B10] border-[#040B10] p-1.5">
              <div
                onClick={
                  !plugin.enable
                    ? () => {}
                    : () =>
                        this.toggleActivation(
                          plugin.name, // TODO: use plugin.id in future.
                        )
                }
                className={
                  !plugin.enable ? toggleEnableClasses : toggleDisableClasses
                }
              >
                <button
                  disabled={!plugin.enable}
                  className="h-[24px] font-body text-base font-normal leading-6"
                >
                  {!plugin.enable ? 'Disabled' : 'Disable'}
                </button>
              </div>
              <div
                onClick={
                  plugin.enable
                    ? () => {}
                    : () =>
                        this.toggleActivation(
                          plugin.name, // TODO: use plugin.id in future.
                        )
                }
                className={
                  plugin.enable ? toggleEnableClasses : toggleDisableClasses
                }
              >
                <button
                  disabled={plugin.enable}
                  className="h-[24px] font-body text-base font-normal leading-6"
                >
                  {plugin.enable ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default AdminPlugins
