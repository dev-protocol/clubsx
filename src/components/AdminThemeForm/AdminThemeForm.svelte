<script lang="ts">
  import type { NavLink } from '@constants/navLink'
  import type {
    ClubsConfiguration,
    ClubsPlugin,
    ClubsPluginOption,
    ClubsPluginOptions,
  } from '@devprotocol/clubs-core'
  import { setConfig } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type {
    colorPresets as ColorPresets,
    GlobalConfigValue,
    HomeConfigValue,
  } from '@plugins/default-theme'
  import AdminThemeDesignForm from './AdminThemeDesignForm.svelte'

  export let options: ClubsPluginOptions
  export let colorPresets: typeof ColorPresets
  export let config: ClubsConfiguration
  export let socialLinks: NavLink[]
  export let navigationLinks: NavLink[]
  export let whiteRightArrowImgSrc: string
  export let homeHeroDefaultImgSrc: string
  export let currentPluginIndex: number

  const globalConfig = (
    options.find((option) => option.key === 'globalConfig') as UndefinedOr<{
      key: 'globalConfig'
      value: GlobalConfigValue
    }>
  )?.value
  const homeConfig = (
    options.find((option) => option.key === 'homeConfig') as UndefinedOr<{
      key: 'homeConfig'
      value: HomeConfigValue
    }>
  )?.value

  const update = (e?: any) => {
    const newConfig: ClubsConfiguration = {
      ...config,
      options: config.options
        ? (config.options.map((opt: ClubsPluginOption) => {
            if (opt.key === 'navigationLinks') {
              return {
                key: 'navigationLinks',
                value: navigationLinks,
              }
            } else if (opt.key === 'socialLinks') {
              return {
                key: 'socialLinks',
                value: socialLinks,
              }
            } else {
              return opt
            }
          }) as ClubsPluginOptions)
        : undefined,
      plugins: config.plugins
        ? (config.plugins.map((plg: ClubsPlugin, i) => {
            if (i !== currentPluginIndex) {
              return plg
            }
            return {
              ...plg,
              options,
            }
          }) as ClubsPlugin[])
        : [],
    }

    setConfig(newConfig)
  }

  const onUpdateThemeOptions = (next: ClubsPluginOptions) => {
    options = next
    update()
  }

  const addNewNavigationLinks = () => {
    navigationLinks = navigationLinks.concat({
      display: '',
      path: '',
    })
  }

  const removeNavigationLinks = (display: string) => {
    navigationLinks = navigationLinks.filter((link) => link.display !== display)
  }
</script>

<form on:change|preventDefault={(e) => update(e)}>
  <section class="hs-form-field is-filled mb-16 w-full ">
    <p class="hs-form-field__label">Navigation links</p>
    {#each navigationLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="hs-form-field__input"
          bind:value={link.display}
          id={`navigationLinks-{i}-display`}
          name={`navigationLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="hs-form-field__input"
          bind:value={link.path}
          id={`navigationLinks-{i}-path`}
          name={`navigationLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large"
          type="button"
          id={`navigationLinks-{i}-remove-btn`}
          name={`navigationLinks-{i}-remove-btn`}
          on:click={() => removeNavigationLinks(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled h-14 w-fit"
      type="button"
      on:click={addNewNavigationLinks}
    >
      Add link
    </button>
  </section>

  <AdminThemeDesignForm
    {globalConfig}
    {homeConfig}
    {currentPluginIndex}
    {colorPresets}
    {homeHeroDefaultImgSrc}
    onUpdate={onUpdateThemeOptions}
  />
</form>
