<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'

  export let currentPluginIndex: number

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }
</script>

<div>form here</div>
