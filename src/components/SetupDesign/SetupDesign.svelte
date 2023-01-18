<script lang="ts">
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { setOptions } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let homeConfig: HomeConfig
  export let currentPluginIndex: number
  let uploading = false

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
    uploading = true

    const file = e.currentTarget.files[0]

    homeConfig.hero.image = await uploadImageAndGetPath(file)
    homeConfig = homeConfig
    uploading = false
  }
</script>

<form on:change|preventDefault={(e) => update()} class="grid gap-16">
  <div>
    <label
      class="hs-form-field grid justify-items-start gap-2"
      name="hero-image"
    >
      <span class="hs-form-field__label"> Cover image </span>
      {#if homeConfig.hero.image && homeConfig.hero.image != '' && uploading === false}
        <img
          src={homeConfig.hero.image}
          class="h-auto max-w-full rounded"
          alt="Hero"
        />
      {/if}
      {#if uploading}
        <div role="presentation" class="h-64 w-full">
          <Skeleton />
        </div>
      {/if}
      <div>
        <span class="hs-button is-filled is-large cursor-pointer"
          >Upload to change</span
        >

        <input
          id="hero-image"
          name="hero-image"
          style="display:none"
          type="file"
          on:change={onFileSelected}
        />
      </div>
    </label>
  </div>

  <label class="hs-form-field is-filled">
    <span class="hs-form-field__label"> Main copy </span>
    <input
      class="hs-form-field__input"
      bind:value={homeConfig.hero.text}
      id="hero-text"
      name="hero-text"
    />
  </label>

  <label class="hs-form-field is-filled">
    <span class="hs-form-field__label">
      Description to introduce about you
    </span>
    <textarea
      rows="10"
      class="hs-form-field__input"
      bind:value={homeConfig.body}
      id="club-description"
      name="club-description"
    />
    <p class="text-sm">Markdown is available</p>
  </label>
</form>
