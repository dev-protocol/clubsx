<script lang="ts">
  import { type ClubsPluginOptions, decode } from '@devprotocol/clubs-core'
  import { setOptions } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type {
    colorPresets as ColorPresets,
    GlobalConfigValue,
    HomeConfigValue,
  } from '@plugins/default-theme'
  import { equals } from 'ramda'
  import { onMount } from 'svelte'

  type ColorPresetKey = keyof typeof ColorPresets

  export let encodedOptions: string
  let options: ClubsPluginOptions = decode(
    encodedOptions
  ) as unknown as ClubsPluginOptions
  export let colorPresets: typeof ColorPresets
  let homeConfig: HomeConfigValue =
    (
      options.find((option) => option.key === 'homeConfig') as UndefinedOr<{
        key: 'homeConfig'
        value: HomeConfigValue
      }>
    )?.value ?? {}
  let globalConfig: GlobalConfigValue =
    (
      options.find((option) => option.key === 'globalConfig') as UndefinedOr<{
        key: 'globalConfig'
        value: GlobalConfigValue
      }>
    )?.value ?? (colorPresets.Purple as GlobalConfigValue)
  export let currentPluginIndex: number
  export let onUpdate: undefined | ((next: ClubsPluginOptions) => void)
  let uploading = false
  let selectedColorPreset: ColorPresetKey =
    (Object.keys(colorPresets as typeof ColorPresets) as ColorPresetKey[]).find(
      (cp: ColorPresetKey) => {
        // Checks globalConfig for already existing value of color
        const preset: GlobalConfigValue = colorPresets[cp] as GlobalConfigValue
        if (preset.bg && globalConfig.bg && preset.bg === globalConfig.bg) {
          return cp
        }
      }
    ) || 'Purple' // else defaults to Purple

  const update = (e?: any) => {
    globalConfig = colorPresets[selectedColorPreset] as GlobalConfigValue
    const newOptions: ClubsPluginOptions = [
      {
        key: 'globalConfig',
        value: globalConfig,
      },
      {
        key: 'homeConfig',
        value: homeConfig,
      },
    ]
    setOptions(newOptions, currentPluginIndex)
    onUpdate && onUpdate(newOptions)
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

    const image = await uploadImageAndGetPath(file)
    homeConfig = {
      ...homeConfig,
      hero: {
        ...homeConfig.hero,
        image,
      },
    }
    uploading = false
    update()
  }

  const getColor = (
    key: string
  ): {
    bg: string
    backgroundGradient?: [string, string]
    ink?: string
  } => {
    return colorPresets[key as keyof typeof ColorPresets] as {
      bg: string
      backgroundGradient?: [string, string]
      ink?: string
    }
  }

  onMount(() => {
    // Assigns the passed colorPresets (that may have been updated) into globalConfig
    if (false === equals(getColor(selectedColorPreset), globalConfig)) {
      update()
    }
  })
</script>

<style>
  .theme-chip:focus-visible {
    outline: 2px solid var(--hs-theme-accent-300);
  }
</style>

<div role="presentation" class="hs-form-field">
  <span class="hs-form-field__label"> Preview </span>
  <div
    class="aspect-square max-w-lg overflow-hidden rounded-xl transition"
    style={`background-color: ${globalConfig.bg}; color: ${globalConfig.ink};`}
  >
    <section class="relative mb-6 h-[50%]">
      <div
        class="absolute bottom-0 left-1/2 aspect-square w-[120%] translate-x-[-50%] translate-y-[50%] rounded-full transition"
        style={((gradient) =>
          `background: radial-gradient(50% 50% at 50% 50%, ${
            gradient ? gradient[0] : 'rgba(0,0,0,0)'
          } 0%, ${gradient ? gradient[1] : 'rgba(0,0,0,0)'} 100%)`)(
          globalConfig.backgroundGradient
        )}
      />
      {#if homeConfig.hero?.image && homeConfig.hero.image != '' && uploading === false}
        <img
          src={homeConfig.hero.image}
          class="absolute h-full w-full max-w-full object-cover"
          alt="Hero"
        />
      {/if}
      {#if uploading}
        <div role="presentation" class="absolute h-full w-full max-w-full">
          <div class="absolute h-full w-full bg-zinc-500" />
          <div class="h-full animate-pulse bg-zinc-400" />
        </div>
      {/if}
    </section>
    <section class="relative px-6">
      <h3
        class="mb-3"
        style="font-size: var(--hs-theme-size-subtitle); font-weight: var(--hs-theme-weight-black); z-index: 10"
      >
        Clubs
      </h3>
      <section class="grid gap-2">
        <div
          class="h-3 w-[50%] rounded opacity-[40%]"
          style="background: {globalConfig.ink}"
        />
        <div
          class="h-3 w-[20%] rounded opacity-[40%]"
          style="background: {globalConfig.ink}"
        />
        <div
          class="h-3 w-[35%] rounded opacity-[40%]"
          style="background: {globalConfig.ink}"
        />
      </section>
    </section>
  </div>
</div>

<form
  on:change|preventDefault={(e) => update()}
  class="grid justify-stretch gap-16"
>
  <div class="hs-form-field grid justify-items-start gap-2">
    <span class="hs-form-field__label"> Theme color </span>
    <div class="flex flex-wrap gap-6">
      {#each Object.keys(colorPresets) as presetKey}
        <label class="theme-chip cursor-pointer">
          <input
            type="radio"
            class="hidden"
            name="selectedColorPreset"
            value={presetKey}
            bind:group={selectedColorPreset}
            checked={equals(getColor(presetKey), globalConfig)}
          />
          <div
            class={`relative h-16 w-16 overflow-hidden rounded ${
              equals(getColor(presetKey), globalConfig)
                ? 'shadow-[0_0_0_3px_rgba(255,255,255,1)]'
                : ''
            }`}
            style={`background-color: ${getColor(presetKey).bg}`}
            title={presetKey}
          >
            {#if getColor(presetKey).backgroundGradient !== undefined}
              <div
                class="absolute h-full w-full"
                style={((gradient) =>
                  `background: linear-gradient(135deg, ${
                    gradient && gradient[0]
                  } 0%, ${gradient && gradient[1]} 100%);`)(
                  getColor(presetKey).backgroundGradient
                )}
              />
            {/if}
            {#if getColor(presetKey).ink !== undefined}
              <div
                class="absolute grid h-full w-full place-items-center font-bold"
                style={((ink) => `color: ${ink};`)(getColor(presetKey).ink)}
              >
                Text
              </div>
            {/if}
          </div></label
        >
      {/each}
    </div>
  </div>

  <div>
    <div class="grid justify-items-start">
      <span class="hs-form-field">
        <span class="hs-form-field__label"> Cover image </span></span
      >
      <label class="hs-form-field w-fit">
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

        <span class="hs-form-field__helper opacity-60"
          >* Recommended image size is 2400 x 1200 px</span
        >
      </label>
      <span class="mt-1 text-xs opacity-60"
        >* Recommended image size is 2400 x 1200 px</span
      >
    </div>
  </div>

  <label class="hs-form-field">
    <span class="hs-form-field__label">
      Short description to introduce about you
    </span>
    <textarea
      rows="5"
      class="hs-form-field__input"
      bind:value={homeConfig.description}
      id="club-description"
      name="club-description"
    />
  </label>

  <label class="hs-form-field">
    <span class="hs-form-field__label"> Your introduction </span>
    <textarea
      rows="10"
      class="hs-form-field__input"
      bind:value={homeConfig.body}
      id="club-body"
      name="club-body"
    />
    <span class="hs-form-field__helper">Markdown is available</span>
  </label>
</form>
