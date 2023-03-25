<script lang="ts">
  import AdminThemeDesignForm from '@components/AdminThemeForm/AdminThemeDesignForm.svelte'
  import type { colorPresets as ColorPresets } from '@plugins/default-theme'

  export let encodedOptions: string
  export let colorPresets: typeof ColorPresets
  export let currentPluginIndex: number
</script>

<AdminThemeDesignForm
  {encodedOptions}
  {currentPluginIndex}
  {colorPresets}
  onUpdate={undefined}
/>
