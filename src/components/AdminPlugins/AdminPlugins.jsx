const AdminPlugins = (props) => {
  const { plugins = [] } = props;

  return (
    <div className="flex flex-col w-full gap-[64px] items-start p-0">
      <p className="h-9 font-Syne font-bold text-2xl leading-9 p-0">Plugins</p>
      {
        plugins.map((plugin, i) => (
          <div className="flex flex-row w-full gap-[10px] justify-between items-center p-0">
            <p className="h-[24px] font-body font-normal text-base leading-6">
              {plugin.name[0].toUpperCase() + plugin.name.slice(1)}
            </p>
            <div
              className="flex flex-row items-center justify-start p-[6px] gap-[16px] h-[68px] border-[##040B10] rounded-[99px] border-[3px] border-[#040B10]"
            >
              {
                !plugin.enable
                  ? (
                    <>
                      <div className="p-[16px] h-[56px] rounded-[999px] bg-[#040B10]">
                        <p className="h-[24px] font-body font-normal text-base leading-6">Disabled</p>
                      </div>
                      <p className="h-[24px] font-body font-normal text-base leading-6">Enable</p>
                    </>
                  )
                  : (
                    <>
                      <p className="h-[24px] font-body font-normal text-base leading-6">Disabled</p>
                      <div className="p-[16px] h-[56px] rounded-[999px] bg-[#040B10]">
                        <p className="h-[24px] font-body font-normal text-base leading-6">Enabled</p>
                      </div>
                    </>
                  )
              }
            </div>
          </div>
        ))
      }
    </div>
  )
}

export default AdminPlugins;
