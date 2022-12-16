<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let homeConfig: HomeConfig
  export let currentPluginIndex: number

  const update = async () => {
    setOptions([{ key: 'homeConfig', value: homeConfig }], currentPluginIndex)
  }

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    const file = e.currentTarget.files[0]

    homeConfig.hero.image = await uploadImageAndGetPath(file)
    homeConfig = homeConfig
  }
</script>

<form on:change|preventDefault={(e) => update()}>
  <div class="mb-10">
    <label class="mb-1 flex flex-col" for="avatarPath">
      <label class="mb-1" for="hero-image"> Image </label>
      {#if homeConfig.hero.image && homeConfig.hero.image != ''}
        <div class="w-32 cursor-pointer">
          <img src={homeConfig.hero.image} alt="Hero" />
        </div>
      {:else}
        <div class="float-left">
          <span
            class="text-sm font-medium px-12 py-4 rounded-lg bg-[#040B10] cursor-pointer"
            type="button">Choose Image</span
          >
        </div>
      {/if}

      <input
        id="hero-image"
        name="hero-image"
        style="display:none"
        type="file"
        on:change={onFileSelected}
      />
    </label>
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
    <textarea
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.body}
      id="club-description"
      name="club-description"
    />
  </div>
</form>
