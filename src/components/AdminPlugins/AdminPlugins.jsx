const AdminPlugins = (props) => {
  const { plugins = [] } = props

  return (
    <div className="flex w-full flex-col items-start gap-[64px] p-0">
      <p className="font-Syne h-9 p-0 text-2xl font-bold leading-9">Plugins</p>
      {plugins.map((plugin, i) => (
        <div className="flex w-full flex-row items-center justify-between gap-[10px] p-0">
          <p className="h-[24px] font-body text-base font-normal leading-6">
            {plugin.name[0].toUpperCase() + plugin.name.slice(1)}
          </p>
          <div className="border-[##040B10] flex h-[68px] flex-row items-center justify-start gap-[16px] rounded-[99px] border-[3px] border-[#040B10] p-[6px]">
            {!plugin.enable ? (
              <>
                <div className="h-[56px] rounded-[999px] bg-[#040B10] p-[16px]">
                  <p className="h-[24px] font-body text-base font-normal leading-6">
                    Disabled
                  </p>
                </div>
                <p className="h-[24px] font-body text-base font-normal leading-6">
                  Enable
                </p>
              </>
            ) : (
              <>
                <p className="h-[24px] font-body text-base font-normal leading-6">
                  Disabled
                </p>
                <div className="h-[56px] rounded-[999px] bg-[#040B10] p-[16px]">
                  <p className="h-[24px] font-body text-base font-normal leading-6">
                    Enabled
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminPlugins
