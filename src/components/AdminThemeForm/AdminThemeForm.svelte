<script lang="ts">
  import { NavLink } from '@constants/navLink'
  import { setOptions } from '@devprotocol/clubs-core'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let navLinks: NavLink[]
  export let sidebarPrimaryLinks: NavLink[]
  export let sidebarLinks: NavLink[]
  export let headerLinks: NavLink[]
  export let socialLinks: NavLink[]
  export let homeConfig: HomeConfig
  export let currentPluginIndex: number
  export let whiteRightArrowImgSrc: string

  const update = (e?: any) => {
    // We don't want to store file in config
    if (e && (e.target.id.includes('-image-') || e.target.type == 'file')) {
      return
    }

    setOptions([{ key: 'homeConfig', value: homeConfig }], currentPluginIndex)
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
</script>

<form on:change|preventDefault={(e) => update(e)}>
  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Sidebar primary links
    </p>
    {#each sidebarPrimaryLinks as link, i}
      <section class="mb-4 flex w-full items-center justify-center gap-4">
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.display}
          id={`sidebarPrimaryLinks-{i}-display`}
          name={`sidebarPrimaryLinks-{i}-display`}
          disabled={!!link.display && link.display !== ''}
        />
        <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.path}
          id={`sidebarPrimaryLinks-{i}-path`}
          name={`sidebarPrimaryLinks-{i}-path`}
        />
        <button
          class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      <section class="mb-4 flex w-full items-center justify-center gap-4">
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.display}
          id={`sidebarLinks-{i}-display`}
          name={`sidebarLinks-{i}-display`}
          disabled={!!link.display && link.display !== ''}
        />
        <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.path}
          id={`sidebarLinks-{i}-path`}
          name={`sidebarLinks-{i}-path`}
        />
        <button
          class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      <section class="mb-4 flex w-full items-center justify-center gap-4">
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.display}
          id={`headerLinks-{i}-display`}
          name={`headerLinks-{i}-display`}
          disabled={!!link.display && link.display !== ''}
        />
        <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.path}
          id={`headerLinks-{i}-path`}
          name={`headerLinks-{i}-path`}
        />
        <button
          class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      <section class="mb-4 flex w-full items-center justify-center gap-4">
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.display}
          id={`socialLinks-{i}-display`}
          name={`socialLinks-{i}-display`}
          disabled={!!link.display && link.display !== ''}
        />
        <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.path}
          id={`socialLinks-{i}-path`}
          name={`socialLinks-{i}-path`}
        />
        <button
          class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
      on:click={addNewSocialLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">Nav links</p>
    {#each navLinks as link, i}
      <section class="mb-4 flex w-full items-center justify-center gap-4">
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.display}
          id={`navLinks-{i}-display`}
          name={`navLinks-{i}-display`}
          disabled={!!link.display && link.display !== ''}
        />
        <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
        <input
          class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
          bind:value={link.path}
          id={`navLinks-{i}-path`}
          name={`navLinks-{i}-path`}
        />
        <button
          class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
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
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
      on:click={addNewNavLink}
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <h2 class="mb-16 font-title text-2xl font-bold text-white">Theme</h2>
    <img
      alt="Cover"
      src={whiteRightArrowImgSrc}
      class="mb-16 h-[484px] w-[95.23%] border-[2px] border-white"
    />
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Cover image
    </p>
    <button
      class="hs-button is-filled mb-[62px] h-[72px] w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-6 px-8 text-base"
      type="button"
    >
      Upload to change
    </button>
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Main copy
    </p>
    <input
      class="font-DMSans mb-[62px] h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
      value={'Join'}
      id="hero-image"
      name="hero-image"
      disabled={true}
    />
    <p class="font-DMSans mb-[7px] text-base font-normal text-white">
      Description to introduce about you
    </p>
    <input
      class="font-DMSans mb-[7px] h-[203px] w-[95.23%] rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
      id="hero-image"
      name="hero-image"
      disabled={true}
    />
    <p class="font-DMSans text-xs font-normal text-white">
      Markdown is available
    </p>
  </section>
</form>
