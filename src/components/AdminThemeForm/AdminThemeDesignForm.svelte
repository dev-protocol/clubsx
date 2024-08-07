<script lang="ts">
  import {
    type ClubsPluginOptions,
    decode,
    i18nFactory,
  } from '@devprotocol/clubs-core'
  import { setOptions } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type {
    colorPresets as ColorPresets,
    GlobalConfigValue,
    HomeConfigValue,
    SectionOrderingValue,
    MembersCountVisibilityValue,
  } from '@plugins/default-theme'
  import { equals } from 'ramda'
  import { onMount } from 'svelte'
  import { Strings } from './i18n'

  type ColorPresetKey = keyof typeof ColorPresets

  export let encodedOptions: string
  let options: ClubsPluginOptions = decode(
    encodedOptions,
  ) as unknown as ClubsPluginOptions
  export let colorPresets: typeof ColorPresets

  let sectionOrderingConfig: SectionOrderingValue =
    (
      options.find((option) => option.key === 'sectionsOrder') as UndefinedOr<{
        key: 'sectionsOrder'
        value: SectionOrderingValue
      }>
    )?.value ?? 'memberships-first'

  let membersCountConfig: MembersCountVisibilityValue =
    (
      options.find((option) => option.key === 'membersCount') as UndefinedOr<{
        key: 'membersCount'
        value: MembersCountVisibilityValue
      }>
    )?.value ?? 'visible'

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
      },
    ) || 'Purple' // else defaults to Purple

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

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
      {
        key: 'sectionsOrder',
        value: sectionOrderingConfig,
      },
      {
        key: 'membersCount',
        value: membersCountConfig,
      },
    ]
    setOptions(newOptions, currentPluginIndex)
    onUpdate && onUpdate(newOptions)
  }

  const onUpdateSectionsOrder = async (orderValue: SectionOrderingValue) => {
    sectionOrderingConfig = orderValue
    update()
  }

  const onUpdateMembersCountVisibilityValue = async (
    visibilityValue: MembersCountVisibilityValue,
  ) => {
    membersCountConfig = visibilityValue
    update()
  }

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
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
    key: string,
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
    i18n = i18nBase(navigator.languages)
  })
</script>

<div role="presentation" class="hs-form-field">
  <span class="hs-form-field__label"> {i18n('Preview')} </span>
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
          globalConfig.backgroundGradient,
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
    <span class="hs-form-field__label"> {i18n('ThemeColor')} </span>
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
                  getColor(presetKey).backgroundGradient,
                )}
              />
            {/if}
            {#if getColor(presetKey).ink !== undefined}
              <div
                class="absolute grid h-full w-full place-items-center font-bold"
                style={((ink) => `color: ${ink};`)(getColor(presetKey).ink)}
              >
                {i18n('Text')}
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
        <span class="hs-form-field__label"> {i18n('CoverImage')} </span></span
      >
      <label class="hs-form-field w-fit">
        <span class="hs-button is-filled is-large cursor-pointer"
          >{i18n('UploadToChange')}</span
        >

        <input
          id="hero-image"
          name="hero-image"
          style="display:none"
          type="file"
          on:change={onFileSelected}
        />

        <span class="hs-form-field__helper opacity-60"
          >* {i18n('RecommendedImageSize')}</span
        >
      </label>
    </div>
  </div>

  <label class="hs-form-field">
    <span class="hs-form-field__label mb-3">
      {i18n('SectionOrdering')}
    </span>
    <div
      class="max-w-full flex gap-0 items-start justify-items-center p-2 bg-[var(--hs-theme-disabled)] w-fit"
    >
      <button
        class={`hs-button is-large border-0 ${sectionOrderingConfig === 'about-first' ? 'is-filled' : 'bg-transparent'}`}
        on:click|preventDefault={() => onUpdateSectionsOrder('about-first')}
        >{i18n('ShowAboutFirst')}</button
      >
      <button
        class={`hs-button is-large border-0 ${sectionOrderingConfig !== 'about-first' ? 'is-filled' : 'bg-transparent'}`}
        on:click|preventDefault={() =>
          onUpdateSectionsOrder('memberships-first')}
        >{i18n('ShowMembershipsFirst')}</button
      >
    </div>
  </label>
  <label class="hs-form-field">
    <span class="hs-form-field__label mb-3">
      {i18n('MembersCountVisibility')}
    </span>
    <div class="flex w-full flex-row items-center justify-between gap-4 p-0">
      <div
        class="flex flex-row items-center justify-start gap-8 rounded-lg border-[3px] border-surface-ink p-3 bg-[var(--hs-theme-disabled)]"
      >
        <button
          on:click|preventDefault={() =>
            onUpdateMembersCountVisibilityValue('visible')}
          class={`hs-button ${membersCountConfig != 'hidden' ? 'is-filled' : 'bg-transparent'}`}
        >
          {i18n('Show')}
        </button>
        <button
          on:click|preventDefault={() =>
            onUpdateMembersCountVisibilityValue('hidden')}
          class={`hs-button ${
            membersCountConfig == 'hidden' ? 'is-filled' : 'bg-transparent'
          }`}
        >
          {i18n('Hide')}
        </button>
      </div>
    </div>
  </label>

  <label class="hs-form-field">
    <span class="hs-form-field__label">
      {i18n('Description')}
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
    <span class="hs-form-field__label"> {i18n('YourIntroduction')} </span>
    <textarea
      rows="10"
      class="hs-form-field__input"
      bind:value={homeConfig.body}
      id="club-body"
      name="club-body"
    />
    <span class="hs-form-field__helper">{i18n('MarkdownSupported')}</span>
  </label>
</form>

<style>
  .theme-chip:focus-visible {
    outline: 2px solid var(--hs-theme-accent-300);
  }
</style>
