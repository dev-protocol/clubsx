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
  import { isNotNil } from '@devprotocol/util-ts'
  import type {
    colorPresets as ColorPresets,
    GlobalConfigValue,
    HomeConfigValue,
  } from '@plugins/default-theme'
  import AdminThemeDesignForm from './AdminThemeDesignForm.svelte'

  const defaultSocialLinks: NavLink[] = [
    { path: '', display: 'Twitter', kind: 'twitter' },
    { path: '', display: 'Discord', kind: 'discord' },
  ]
  export let options: ClubsPluginOptions
  export let colorPresets: typeof ColorPresets
  export let config: ClubsConfiguration
  export let socialLinks: NavLink[] = defaultSocialLinks
  export let navigationLinks: NavLink[]
  export let whiteRightArrowImgSrc: string
  export let homeHeroDefaultImgSrc: string
  export let currentPluginIndex: number

  if (socialLinks.length < 2) {
    socialLinks = Array.from(
      new Set([...socialLinks, ...defaultSocialLinks])
    ).filter(isNotNil)
  }

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
            }
            if (opt.key === 'socialLinks') {
              return {
                key: 'socialLinks',
                value: socialLinks,
              }
            }
            return opt
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

<form on:change|preventDefault={(e) => update(e)} class="grid gap-16">
  <section class="hs-form-field is-filled w-full ">
    <p class="hs-form-field__label">Navigation links</p>
    {#each navigationLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="hs-form-field__input"
          bind:value={link.display}
          id={`navigationLinks-${i}-display`}
          name={`navigationLinks-${i}-display`}
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
          id={`navigationLinks-${i}-path`}
          name={`navigationLinks-${i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large"
          type="button"
          id={`navigationLinks-${i}-remove-btn`}
          name={`navigationLinks-${i}-remove-btn`}
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

  <label class="hs-form-field is-filled">
    <span class="hs-form-field__label"> Social links </span>
    {#each socialLinks as link, i}
      <div class="mb-4 flex flex-col items-start lg:flex-row lg:items-center">
        <span class="hs-form-field__label w-28 text-sm capitalize"
          >{link.kind}</span
        >
        <input
          class="hs-form-field__input"
          bind:value={link.path}
          id={`socialLinks-${i}-path`}
          name={`socialLinks-${i}-path`}
          placeholder={link.path}
        />
      </div>
    {/each}
  </label>

  <h2 class="font-title text-2xl font-bold">Design</h2>

  <AdminThemeDesignForm
    {globalConfig}
    {homeConfig}
    {currentPluginIndex}
    {colorPresets}
    {homeHeroDefaultImgSrc}
    onUpdate={onUpdateThemeOptions}
  />
</form>
