<script lang="ts">
  import type { NavLink } from '@constants/navLink'
  import {
    type ClubsConfiguration,
    type ClubsPlugin,
    type ClubsPluginOptions,
    decode,
  } from '@devprotocol/clubs-core'
  import { setConfig } from '@devprotocol/clubs-core'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { isNotNil } from '@devprotocol/util-ts'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { colorPresets as ColorPresets } from '@plugins/default-theme'
  import AdminThemeDesignForm from './AdminThemeDesignForm.svelte'

  const defaultSocialLinks: NavLink[] = [
    { path: '', display: 'Twitter', kind: 'twitter' },
    { path: '', display: 'Discord', kind: 'discord' },
  ]
  export let encodedOptions: string
  let options: ClubsPluginOptions = decode(
    encodedOptions
  ) as unknown as ClubsPluginOptions
  export let colorPresets: typeof ColorPresets
  export let config: ClubsConfiguration
  export let socialLinks: NavLink[] = defaultSocialLinks
  export let navigationLinks: NavLink[]
  export let whiteRightArrowImgSrc: string
  export let currentPluginIndex: number

  let uploading = false

  if (socialLinks.length < 2) {
    socialLinks = Array.from(
      new Set([...socialLinks, ...defaultSocialLinks])
    ).filter(isNotNil)
  }

  let ogpValue = config.options?.find((option) => option.key === 'ogp')
    ?.value as UndefinedOr<{ image?: string }>

  const update = (e?: any) => {
    const _navigationLinks = {
      key: 'navigationLinks',
      value: navigationLinks,
    }
    const _socialLinks = {
      key: 'socialLinks',
      value: socialLinks,
    }
    const _ogp = {
      key: 'ogp',
      value: ogpValue,
    }
    const newConfig: ClubsConfiguration = {
      ...config,
      options: config.options
        ? ([
            ...config.options.filter(
              ({ key }) =>
                key !== 'navigationLinks' &&
                key !== 'socialLinks' &&
                key !== 'ogp'
            ),
            _navigationLinks,
            _socialLinks,
            _ogp,
          ] as ClubsPluginOptions)
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
    update()
  }

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    // already uploading
    if (uploading) {
      return
    }

    uploading = true

    const file = e.currentTarget.files[0]

    const image = await uploadImageAndGetPath(file)
    ogpValue = { image }
    uploading = false
    update()
  }

  const removeNavigationLinks = (display: string) => {
    navigationLinks = navigationLinks.filter((link) => link.display !== display)
    update()
  }
</script>

<form on:change|preventDefault={(e) => update(e)} class="grid gap-16">
  <section class="hs-form-field w-full">
    <p class="hs-form-field__label mb-4">Navigation links</p>
    <section>
      {#each navigationLinks as link, i}
        <section
          class="mb-8 flex flex-row gap-4 items-center"
        >
          <div class="w-full flex flex-row justify-center items-center gap-4">
            <input
              class="hs-form-field__input w-full"
              bind:value={link.display}
              id={`navigationLinks-${i}-display`}
              name={`navigationLinks-${i}-display`}
              placeholder={link.display}
            />
            <img
              alt="Status"
              src={whiteRightArrowImgSrc}
              class="h-6 w-6"
            />
            <input
              class="hs-form-field__input w-full"
              bind:value={link.path}
              id={`navigationLinks-${i}-path`}
              name={`navigationLinks-${i}-path`}
              placeholder={link.path}
            />
          </div>
          <button
            class="hs-button is-error is-filled is-large max-w-fit"
            type="button"
            id={`navigationLinks-${i}-remove-btn`}
            name={`navigationLinks-${i}-remove-btn`}
            on:click={() => removeNavigationLinks(link.display)}
          >
            <i class="hs-button__icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </i>
          </button>
        </section>
      {/each}
    </section>
    <section
      class="mb-8 flex flex-row gap-4 items-center"
    >
      <div class="w-full flex flex-row justify-center items-center gap-4">
        <input
          readonly
          class="hs-form-field__input w-full cursor-not-allowed"
          placeholder=""
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6"
        />
        <input
          readonly
          class="hs-form-field__input w-full cursor-not-allowed"
          placeholder=""
        />
      </div>
      <button
        class="hs-button is-filled is-large max-w-fit"
        type="button"
        name="link-add-button"
        on:click={addNewNavigationLinks}
      >
        <i class="hs-button__icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </svg>
        </i>
      </button>
    </section>
  </section>

  <label class="hs-form-field">
    <span class="hs-form-field__label mb-4"> Social links </span>
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

  <div>
    <div class="grid justify-items-start gap-2">
      <span class="hs-form-field">
        <span class="hs-form-field__label">
          OGP (Open Graph Protocol) Image</span
        >
      </span>
      {#if ogpValue?.image && uploading === false}
        <img src={ogpValue.image} class="max-w-md rounded" alt="OGP" />
      {/if}
      {#if uploading}
        <div
          role="presentation"
          class="aspect-video w-full max-w-md animate-pulse rounded bg-zinc-400"
        />
      {/if}
      <label class="hs-form-field w-fit">
        <span class="hs-button is-filled is-large cursor-pointer"
          >Upload to change</span
        >

        <input
          id="ogp-image"
          name="ogp-image"
          style="display:none"
          type="file"
          class="hs-button is-filled is-large cursor-pointer"
          on:change={onFileSelected}
        />
        <span class="mt-1 text-xs opacity-60"
          >*Image size should be 1200 x 630 pixels</span
        >
      </label>
    </div>
  </div>

  <h2 class="font-title text-2xl font-bold">Design</h2>

  <AdminThemeDesignForm
    {currentPluginIndex}
    {colorPresets}
    {encodedOptions}
    onUpdate={onUpdateThemeOptions}
  />
</form>
