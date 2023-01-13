<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { HomeConfig } from '../../constants/homeConfig'

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
</script>

<form on:change|preventDefault={(e) => update(e)}>
  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Sidebar primary links
    </p>
    <section class="mb-4 flex w-full items-center justify-center gap-4">
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <button
        class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
        type="button"
      >
        Add image
      </button>
    </section>
    <button
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Sidebar links
    </p>
    <section class="mb-4 flex w-full items-center justify-center gap-4">
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <button
        class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
        type="button"
      >
        Add image
      </button>
    </section>
    <button
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Header links
    </p>
    <section class="mb-4 flex w-full items-center justify-center gap-4">
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <button
        class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
        type="button"
      >
        Add image
      </button>
    </section>
    <button
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
    >
      Add link
    </button>
  </section>

  <section class="mb-16 w-full">
    <p class="font-DMSans mb-4 text-base font-normal text-white">
      Social links
    </p>
    <section class="mb-4 flex w-full items-center justify-center gap-4">
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <img alt="Status" src={whiteRightArrowImgSrc} class="h-6 w-6" />
      <input
        class="font-DMSans h-[72px] flex-1 rounded border-[3px] border-[#000000] bg-[#040B10] px-8 py-6 text-base font-normal text-[#C4C4C4]"
        value={'Join'}
        id="hero-image"
        name="hero-image"
        disabled={true}
      />
      <button
        class="hs-button is-filled h-[72px] rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
        type="button"
      >
        Add image
      </button>
    </section>
    <button
      class="hs-button is-filled h-14 w-fit rounded border-[3px] border-[#000000] bg-[#040B10] py-4 px-6 text-base"
      type="button"
    >
      Add link
    </button>
  </section>
</form>
