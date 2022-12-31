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
    <label class="grid justify-items-start gap-2" name="hero-image">
      <span class=""> Cover image </span>
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
        <span
          class="block cursor-pointer rounded bg-[#040B10] px-12 py-4 text-sm font-medium"
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

  <div class="grid justify-start gap-2">
    <label for="hero-text"> Main copy </label>
    <input
      size="50"
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.hero.text}
      id="hero-text"
      name="hero-text"
    />
  </div>

  <div class="grid gap-2">
    <label for="club-description"> Description to introduce about you </label>
    <textarea
      rows="10"
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={homeConfig.body}
      id="club-description"
      name="club-description"
    />
    <p class="text-sm">Markdown is available</p>
  </div>
</form>
