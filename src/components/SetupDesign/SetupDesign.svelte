<script lang="ts">
  import AdminThemeDesignForm from '@components/AdminThemeForm/AdminThemeDesignForm.svelte'
  import type { ClubsPluginOptions } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type {
    colorPresets as ColorPresets,
    GlobalConfigValue,
    HomeConfigValue,
  } from '@plugins/default-theme'

  export let options: ClubsPluginOptions
  export let colorPresets: typeof ColorPresets
  export let currentPluginIndex: number

  const globalConfig = (
    options.find((option) => option.key === 'globalConfig') as UndefinedOr<{
      key: 'globalConfig'
      value: GlobalConfigValue
    }>
  )?.value
  const homeConfig = (
    options.find((option) => option.key === 'homeConfig') as UndefinedOr<{
      key: 'homeConfig'
      value: HomeConfigValue
    }>
  )?.value
</script>

<AdminThemeDesignForm
  {globalConfig}
  {homeConfig}
  {currentPluginIndex}
  {colorPresets}
  onUpdate={undefined}
/>
