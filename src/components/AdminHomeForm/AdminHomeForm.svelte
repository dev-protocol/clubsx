<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import type { HomeConfig } from '../../constants/homeConfig'

  let fileinput: any;
  export let homeConfig: HomeConfig
  export let currentPluginIndex: number

  const update = (e: any) => {
    if (e.target.id.includes('-image-') || e.target.type == 'file') return;  // We don't want to store file in config
    setOptions([{ key: 'homeConfig', value: homeConfig }], currentPluginIndex)
  }

  const addWhatWeDo = () => {
    homeConfig = {
      ...homeConfig,
      whatWeDo: {
        ...homeConfig.whatWeDo,
        images: homeConfig.whatWeDo.images.concat({
          image: '',
          description: '',
        }),
      },
    }
  }

  const addPerks = () => {
    homeConfig = {
      ...homeConfig,
      perks: {
        ...homeConfig.perks,
        images: homeConfig.perks.images.concat({ image: '', description: '' }),
      },
    }
  }

  const uploadImageAndGetPath = (image: string) => {
    if (!image) return '';
    // Upload the image and return path
    return 'ABC';
  }

  const updateWhatWeDoImgUrl = (i: number, imageURl: string) => {
    homeConfig.whatWeDo.images[i] = {
      image: imageURl,
      description: homeConfig.whatWeDo.images[i].description
    }
  }

  const onWhatWeDoFileSelected = (i: number, e: any) => {
    let image = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
      const imgData = e?.target?.result?.toString() || '';
      const path = uploadImageAndGetPath(imgData);
      updateWhatWeDoImgUrl(i, path);
    };
  }
</script>

<form on:change|preventDefault={(e) => update(e)}>
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

      {#each homeConfig.whatWeDo.images as image, i}
        <div>
          <div class="mb-10 flex flex-col">
            <label class="mb-1" for={`whatwedo-image-${i}`}>Image {i + 1} </label>
            {#if image.image && image.image != ''}
              <input
                class="rounded bg-[#040B10] px-8 py-4"
                bind:value={image.image}
                id={`whatwedo-image-${i}`}
                name={`whatwedo-image-${i}`}
              />
            {:else}
              <button for={`whatwedo-image-${i}`} class="hs-button is-filled" type="button" on:click={()=>{fileinput.click();}}>Choose Image</button>
              <input id={`whatwedo-image-${i}`} name={`whatwedo-image-${i}`} style="display:none" type="file" on:change={(e)=> onWhatWeDoFileSelected(i, e)} bind:this={fileinput} >
            {/if}
          </div>

          <div class="mb-10 flex flex-col">
            <label class="mb-1" for={`whatwedo-image-${i}-description`}>
              Image {i + 1} Description
            </label>
            <input
              class="rounded bg-[#040B10] px-8 py-4"
              bind:value={image.description}
              id={`whatwedo-image-${i}-description`}
              name={`whatwedo-image-${i}-description`}
            />
          </div>

          {#if i === homeConfig.whatWeDo.images.length - 1}
            <button
              class="hs-button is-filled"
              type="button"
              on:click={addWhatWeDo}>Add image</button
            >
          {/if}
        </div>
      {/each}

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
              <label class="mb-1" for={`perk-image-${i}`}>
                Perk Image {i + 1}
              </label>
              <input
                class="rounded bg-[#040B10] px-8 py-4"
                bind:value={perkImage.image}
                id={`perk-image-${i}`}
                name={`perk-image-${i}`}
              />
            </div>

            <div class="mb-10 flex flex-col">
              <label class="mb-1" for={`perk-image-${i}-description`}>
                Perk Image {i + 1} Description
              </label>
              <input
                class="rounded bg-[#040B10] px-8 py-4"
                bind:value={perkImage.description}
                id={`perk-image-${i}-description`}
                name={`perk-image-${i}-description`}
              />
            </div>
          </div>

          {#if i === homeConfig.perks.images.length - 1}
            <button
              class="hs-button is-filled"
              type="button"
              on:click={addPerks}>Add image</button
            >
          {/if}
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
  </div>
</form>
