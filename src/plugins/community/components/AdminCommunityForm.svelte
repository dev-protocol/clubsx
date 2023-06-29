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
    <label class="hs-form-field">
      <span class="hs-form-field__label">Guild URL</span>
      <input
        class="hs-form-field__input"
        id="guild-url"
        name="guild-url"
        type="text"
        bind:value={guildUrl}
        on:input={updateCommunityOptions}
      />
    </label>
  </div>
</form>
