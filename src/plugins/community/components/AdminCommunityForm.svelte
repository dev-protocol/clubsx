<script lang="ts">
  export let guildUrl: string
  export let currentPluginIndex: number
  import { setOptions } from '@devprotocol/clubs-core'

  const updateCommunityOptions = () => {
    setOptions([{ key: 'guildUrl', value: guildUrl }], currentPluginIndex)
  }
</script>

<form>
  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="guild-url">Guild URL</label>
    <input
      bind:value={guildUrl}
      on:input={updateCommunityOptions}
      class="rounded bg-[#040B10] px-8 py-4"
      id="guild-url"
      name="guild-url"
    />
  </div>
</form>
