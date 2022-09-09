import React from 'react'

class AdminPlugins extends React.Component {
  constructor(props) {
    super(props)
    this.state = { plugins: props.plugins }
    this.toggleActivation = this.toggleActivation.bind(this)
  }

  toggleActivation = (index) => {
    this.setState((prevState) => {
      const plugins = prevState.plugins
      const pluginDetails = { ...plugins[index] }
      pluginDetails.enable = !pluginDetails.enable
      plugins[index] = pluginDetails
      return { plugins }
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
          <div className="flex w-full flex-row items-center justify-between gap-[10px] p-0">
            <p className="h-[24px] font-body text-base font-normal leading-6">
              {plugin.name[0].toUpperCase() + plugin.name.slice(1)}
            </p>
            <div className="border-[##040B10] flex h-[68px] flex-row items-center justify-start gap-[16px] rounded-[99px] border-[3px] border-[#040B10] p-1.5">
              <div
                onClick={
                  !plugin.enable ? () => {} : () => this.toggleActivation(i)
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
                  plugin.enable ? () => {} : () => this.toggleActivation(i)
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
