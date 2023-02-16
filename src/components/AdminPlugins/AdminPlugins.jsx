import React from 'react'
import { decode, setConfig } from '@devprotocol/clubs-core'

class AdminPlugins extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: decode(props.clubs.encodedClubsConfiguration),
      plugins: props.clubs.plugins,
    }
    this.toggleActivation = this.toggleActivation.bind(this)
  }

  toggleActivation = (pluginName) => {
    this.setState((prevState) => {
      // Take plugins from the prevState.
      const plugins = prevState.plugins

      // 1. Find index of plugin.
      const index = plugins.findIndex((plugin) => plugin.name === pluginName)
      if (index === -1) return prevState

      // 2. Extract it's details.
      const pluginDetails = { ...plugins[index] }
      // 3. Toggle plugin.
      pluginDetails.enable = !pluginDetails.enable
      // 4. Update the toggle w.r.t all plugins.
      plugins[index] = pluginDetails
      // 5. Update the config.
      const config = { ...prevState.config, plugins }
      // 6. Set config.
      setConfig(config)
      // 7. Update component state.
      return { config: { ...prevState.config, plugins }, plugins: [...plugins] }
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
        {this.state.plugins.map((plugin, i) => (
          <div
            className="flex w-full flex-row items-center justify-between gap-[10px] p-0"
            key={i}
          >
            <p className="h-[24px] font-body text-base font-normal capitalize leading-6">
              {plugin.name}
            </p>
            <div className="flex h-[68px] flex-row items-center justify-start gap-[16px] rounded-[99px] border-[3px] border-[##040B10] border-[#040B10] p-1.5">
              <div
                onClick={
                  !plugin.enable
                    ? () => {}
                    : () => this.toggleActivation(plugin.name)
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
                    : () => this.toggleActivation(plugin.name)
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
