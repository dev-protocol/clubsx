<script lang="ts">
  import Skeleton from '@components/Global/Skeleton.svelte'
  import { NavLink } from '@constants/navLink'
  import {
    ClubsConfiguration,
    ClubsPluginOption,
    ClubsPluginOptions,
    setConfig,
  } from '@devprotocol/clubs-core'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let config: ClubsConfiguration
  export let navLinks: NavLink[]
  export let sidebarPrimaryLinks: NavLink[]
  export let sidebarLinks: NavLink[]
  export let headerLinks: NavLink[]
  export let socialLinks: NavLink[]
  export let homeConfig: HomeConfig
  export let whiteRightArrowImgSrc: string
  export let homeHeroDefaultImgSrc: string
  let uploading = false

  const update = (e?: any) => {
    const newConfig: ClubsConfiguration = {
      ...config,
      options: config.options
        ? (config.options.map((option: ClubsPluginOption) => {
            if (option.key === 'headerLinks') {
              return {
                key: 'headerLinks',
                value: headerLinks,
              }
            } else if (option.key === 'homeConfig') {
              return {
                key: 'homeConfig',
                value: homeConfig,
              }
            } else if (option.key === 'socialLinks') {
              return {
                key: 'socialLinks',
                value: socialLinks,
              }
            } else if (option.key === 'sidebarPrimaryLinks') {
              return {
                key: 'sidebarPrimaryLinks',
                value: sidebarPrimaryLinks,
              }
            } else if (option.key === 'sidebarLinks') {
              return {
                key: 'sidebarLinks',
                value: sidebarLinks,
              }
            } else if (option.key === 'navLinks') {
              return {
                key: 'navLinks',
                value: navLinks,
              }
            } else {
              return option
            }
          }) as ClubsPluginOptions)
        : undefined,
    }

    console.log('HERE', config, newConfig)
    setConfig(newConfig)
  }

  const addNewSidebarPrimaryLink = () => {
    sidebarPrimaryLinks = sidebarPrimaryLinks.concat({
      display: '',
      path: '',
    })
  }

  const addNewSocialLink = () => {
    socialLinks = socialLinks.concat({
      display: '',
      path: '',
    })
  }

  const addNewSidebarLink = () => {
    sidebarLinks = sidebarLinks.concat({
      display: '',
      path: '',
    })
  }

  const addNewHeaderLink = () => {
    headerLinks = headerLinks.concat({
      display: '',
      path: '',
    })
  }

  const addNewNavLink = () => {
    navLinks = navLinks.concat({
      display: '',
      path: '',
    })
  }

  const removeSidebarPrimaryLink = (display: string) => {
    sidebarPrimaryLinks = sidebarPrimaryLinks.filter(
      (link) => link.display !== display
    )
  }

  const removeSidebarLink = (display: string) => {
    sidebarLinks = sidebarLinks.filter((link) => link.display !== display)
  }

  const removeHeaderLink = (display: string) => {
    headerLinks = headerLinks.filter((link) => link.display !== display)
  }

  const removeSocialLink = (display: string) => {
    socialLinks = socialLinks.filter((link) => link.display !== display)
  }

  const removeNavLink = (display: string) => {
    navLinks = navLinks.filter((link) => link.display !== display)
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

  const onUploadClick = (id: string) => {
    document.getElementById(id)?.click()
  }
</script>

<form on:change|preventDefault={(e) => update(e)}>
  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Sidebar primary links
    </p>
    {#each sidebarPrimaryLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="font-DMSans flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.display}
          id={`sidebarPrimaryLinks-{i}-display`}
          name={`sidebarPrimaryLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.path}
          id={`sidebarPrimaryLinks-{i}-path`}
          name={`sidebarPrimaryLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled  rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
          type="button"
          id={`sidebarPrimaryLinks-{i}-remove-btn`}
          name={`sidebarPrimaryLinks-{i}-remove-btn`}
          on:click={() => removeSidebarPrimaryLink(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
      on:click={addNewSidebarPrimaryLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Sidebar links
    </p>
    {#each sidebarLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.display}
          id={`sidebarLinks-{i}-display`}
          name={`sidebarLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.path}
          id={`sidebarLinks-{i}-path`}
          name={`sidebarLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large rounded border-[3px] border-[#000000] bg-[#040B10]"
          type="button"
          id={`sidebarLinks-{i}-remove-btn`}
          name={`sidebarLinks-{i}-remove-btn`}
          on:click={() => removeSidebarLink(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled is-large w-fit rounded border-[3px] border-[#000000] bg-[#040B10] text-base"
      type="button"
      on:click={addNewSidebarLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Header links
    </p>
    {#each headerLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.display}
          id={`headerLinks-{i}-display`}
          name={`headerLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.path}
          id={`headerLinks-{i}-path`}
          name={`headerLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large border-[3px] border-[#000000] bg-[#040B10]"
          type="button"
          id={`headerLinks-{i}-remove-btn`}
          name={`headerLinks-{i}-remove-btn`}
          on:click={() => removeHeaderLink(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled is-large w-fit rounded border-[3px] border-[#000000] bg-[#040B10]"
      type="button"
      on:click={addNewHeaderLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Social links
    </p>
    {#each socialLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.display}
          id={`socialLinks-{i}-display`}
          name={`socialLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.path}
          id={`socialLinks-{i}-path`}
          name={`socialLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large border-[3px] border-[#000000] bg-[#040B10]"
          type="button"
          id={`socialLinks-{i}-remove-btn`}
          name={`socialLinks-{i}-remove-btn`}
          on:click={() => removeSocialLink(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled is-large w-fit rounded border-[3px] border-[#000000] bg-[#040B10]"
      type="button"
      on:click={addNewSocialLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">Nav links</p>
    {#each navLinks as link, i}
      <section
        class="mb-4 flex w-full flex-col items-start justify-center gap-4 lg:flex-row lg:items-center"
      >
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.display}
          id={`navLinks-{i}-display`}
          name={`navLinks-{i}-display`}
          placeholder={link.display}
        />
        <img
          alt="Status"
          src={whiteRightArrowImgSrc}
          class="h-6 w-6 rotate-90 lg:rotate-0"
        />
        <input
          class="font-DMSans  flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
          bind:value={link.path}
          id={`navLinks-{i}-path`}
          name={`navLinks-{i}-path`}
          placeholder={link.path}
        />
        <button
          class="hs-button is-filled is-large border-[3px] border-[#000000] bg-[#040B10]"
          type="button"
          id={`navLinks-{i}-remove-btn`}
          name={`navLinks-{i}-remove-btn`}
          on:click={() => removeNavLink(link.display)}
        >
          Remove
        </button>
      </section>
    {/each}
    <button
      class="hs-button is-filled is-large w-fit rounded border-[3px] border-[#000000] bg-[#040B10]"
      type="button"
      on:click={addNewNavLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <h2 class="mb-16 font-title text-2xl font-bold text-white">Theme</h2>
    {#if homeConfig.hero.image && homeConfig.hero.image != '' && uploading === false}
      <img
        alt="Cover"
        src={homeConfig.hero.image === '' && homeConfig.hero.image
          ? homeHeroDefaultImgSrc
          : homeConfig.hero.image}
        class="mb-16 h-[484px] w-[95.23%] rounded-[5px]"
      />
    {/if}
    {#if uploading}
      <div role="presentation" class="h-64 w-full">
        <Skeleton />
      </div>
    {/if}
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Cover image
    </p>
    <div>
      <button
        on:click={() => onUploadClick(`hero-image`)}
        type="button"
        class="hs-button is-filled mb-[62px]  w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8 text-base"
      >
        Upload to change
      </button>
      <input
        class="hs-button is-filled mb-[62px]  w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8 text-base"
        style="display:none"
        type="file"
        id="hero-image"
        on:change={onFileSelected}
      />
    </div>
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Main copy
    </p>
    <input
      class="font-DMSans mb-[62px]  w-[95.23%] rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
      bind:value={homeConfig.hero.text}
      id="hero-text"
      name="hero-text"
      placeholder={homeConfig.hero.text}
    />
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Description to introduce about you
    </p>
    <textarea
      rows="10"
      class="font-DMSans mb-[7px] h-[203px] w-[95.23%] rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-4 text-base font-normal text-[#C4C4C4] outline-none transition-colors focus:border-white"
      id="club-description"
      name="club-description"
      placeholder={homeConfig.body}
      bind:value={homeConfig.body}
    />
    <p class="font-DMSans text-xs font-normal text-white">
      Markdown is available
    </p>
  </section>
</form>
