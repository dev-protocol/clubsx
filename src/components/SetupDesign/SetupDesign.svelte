<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let homeConfig: HomeConfig
  export let currentPluginIndex: number

  const update = async () => {
    setOptions([{ key: 'homeConfig', value: homeConfig }], currentPluginIndex)
  }
</script>

<form on:change|preventDefault={(e) => update()}>
  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="hero-image"> Image </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.hero.image}
      id="hero-image"
      name="hero-image"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="hero-text"> Text </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.hero.text}
      id="hero-text"
      name="hero-text"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="club-description"> Club Description </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.body}
      id="club-description"
      name="club-description"
    />
  </div>
</form>
