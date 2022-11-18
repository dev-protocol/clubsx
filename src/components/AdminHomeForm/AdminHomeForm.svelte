<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { HomeConfig } from '../../constants/homeConfig'

  export let homeConfig: HomeConfig
  export let currentPluginIndex: number

  const update = () => {
    setOptions([{ key: 'homeConfig', value: homeConfig }], currentPluginIndex)
  }
</script>

<form on:change|preventDefault={(_) => update()}>
  <div class="divide-y">
    <div class="mb-4 flex flex-col">
      <span class="mb-4 text-lg font-bold">Hero</span>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="hero-image"> Image </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.hero.image}
          id="hero-image"
          name="hero-image"
        />
      </div>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="hero-image"> Text </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.hero.text}
          id="hero-text"
          name="hero-text"
        />
      </div>
    </div>

    <div class="my-4 flex flex-col pt-8">
      <span class="mb-4 text-lg font-bold">What We Do</span>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="what-we-do-text"> Section Text </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.whatWeDo.text}
          id="what-we-do-text"
          name="what-we-do-text"
        />
      </div>

      {#if homeConfig.whatWeDo.images[0]}
        <div class="mb-10 flex flex-col">
          <label class="mb-1" for="what-we-do-image-1"> Image 1 </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={homeConfig.whatWeDo.images[0].image}
            id="what-we-do-image-1"
            name="what-we-do-image-1"
          />
        </div>

        <div class="mb-10 flex flex-col">
          <label class="mb-1" for="what-we-do-image-1-description">
            Image 1 Description
          </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={homeConfig.whatWeDo.images[0].description}
            id="what-we-do-image-1-description"
            name="what-we-do-image-1-description"
          />
        </div>
      {/if}

      {#if homeConfig.whatWeDo.images[1]}
        <div class="mb-10 flex flex-col">
          <label class="mb-1" for="what-we-do-image-1"> Image 2 </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={homeConfig.whatWeDo.images[1].image}
            id="what-we-do-image-2"
            name="what-we-do-image-2"
          />
        </div>

        <div class="mb-10 flex flex-col">
          <label class="mb-1" for="what-we-do-image-2-description">
            Image 2 Description
          </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={homeConfig.whatWeDo.images[0].description}
            id="what-we-do-image-2-description"
            name="what-we-do-image-2-description"
          />
        </div>
      {/if}
    </div>

    <div class="my-4 flex flex-col pt-8">
      <span class="mb-4 text-lg font-bold">Perks</span>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="perks-header-text"> Header Text </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.perks.headerText}
          id="perks-header-text"
          name="perks-header-text"
        />
      </div>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="perks-header-sub-text">
          Header Sub Text
        </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.perks.subText}
          id="perks-header-sub-text"
          name="perks-header-sub-text"
        />
      </div>

      {#each homeConfig.perks.images as perkImage, i}
        <div>
          <div class="mb-10 flex flex-col">
            <label class="mb-1" for={`perk-image-${i}`}> Perk Image {i} </label>
            <input
              class="rounded bg-[#040B10] px-8 py-4"
              bind:value={perkImage.image}
              id={`perk-image-${i}`}
              name={`perk-image-${i}`}
            />
          </div>

          <div class="mb-10 flex flex-col">
            <label class="mb-1" for={`perk-image-${i}-description`}>
              Perk Image {i} Description
            </label>
            <input
              class="rounded bg-[#040B10] px-8 py-4"
              bind:value={perkImage.description}
              id={`perk-image-${i}-description`}
              name={`perk-image-${i}-description`}
            />
          </div>
        </div>
      {/each}
    </div>

    <div class="my-4 flex flex-col pt-8">
      <span class="mb-4 text-lg font-bold">Quote</span>

      <div class="mb-10 flex flex-col">
        <label class="mb-1" for="quote"> Quote </label>
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={homeConfig.quote}
          id="quote"
          name="quote"
        />
      </div>
    </div>
  </div>
</form>
