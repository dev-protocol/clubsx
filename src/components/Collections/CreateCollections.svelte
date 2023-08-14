<script lang="ts">
  import type { Membership } from '@plugins/memberships'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'

  export let memberships: Membership[] = []
  export let isTimeLimitedCollection: boolean = false
  export let name: string
  export let isAdding: boolean = false

  const update = (e?: any) => {}
</script>

<form on:change|preventDefault={(e) => update(e)} class="w-full">
  <div class="w-full max-w-full">
    <!-- collection name -->
    <div
      class="mb-16 flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body">Collection name </span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <input
        class="w-[479px] rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="collection-name"
        name="collection-name"
      />
    </div>
    <!-- collection cover image uploader-->
    <div class="mb-16 flex h-[294px] w-[479px] flex-col items-start gap-[7px]">
      <div class="flex items-start gap-[13px]">
        <span class="text-base font-normal text-white"
          >Collection cover image</span
        >
        <span class="text-base font-normal uppercase text-[#EB48F8]"> * </span>
      </div>
      <label>
        <div
          class="flex flex-col items-start self-stretch rounded-[19px] border border-[#ffffff1a] bg-[#ffffff1a] p-2"
        >
          <div class="h-[216px] w-[463px] rounded-[12px] bg-[#040B10]" />
        </div>
        <input
          id="collection-cover-image"
          name="collection-cover-image"
          style="display:none"
          type="file"
          class="hs-button is-filled is-large cursor-pointer"
        />
      </label>
      <span class="text-base font-normal leading-6 text-white"
        >Recommended image size is 2400 x 1200px</span
      >
    </div>

    <!-- start date -->
    <div class="mb-16 flex w-[479px] flex-col items-start gap-[7px]">
      <div class="flex items-start gap-[13px]">
        <span class="text-base font-normal text-white">Start date</span>
        <span class="text-base font-normal uppercase text-[#EB48F8]"> * </span>
      </div>
      <input
        type="datetime-local"
        class="w-[479px] rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="collectino-start-date"
        name="collection-start-date"
      />
    </div>

    {#if isTimeLimitedCollection}
      <div class="mb-16 flex w-[479px] flex-col items-start gap-[7px]">
        <div class="flex items-start gap-[13px]">
          <span class="text-base font-normal text-white">End date</span>
          <span class="text-base font-normal uppercase text-[#EB48F8]">
            *
          </span>
        </div>
        <input
          type="datetime-local"
          class="w-[479px] rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
          id="collectino-start-date"
          name="collection-start-date"
        />
      </div>
    {/if}

    <div
      class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body">Description</span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <textarea
        class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="collection-description"
        name="collection-description"
        rows="3"
      />
      <p class="text-xs">Markdown is available</p>
    </div>

    <!-- Allowlist -->
    <div
      class="flex h-[682px] max-w-4xl flex-shrink-0 flex-col items-start gap-[7px]"
    >
      <span class="text-base font-normal">Allowlist</span>
      <span class="text-base font-normal"
        >Please set the people who can access this collection. Add new
        memberships from [here].</span
      >
      <div class="flex flex-col items-start self-stretch">
        <span class="text-lg font-medium uppercase text-[#EB48F8]"
          >When the allowlist is empty. Or, by clicking this, it makes the
          allowlist empty.</span
        >
        <div
          class="flex items-start gap-[12px] self-stretch rounded-[12px] bg-[#040B10] p-5"
        >
          <div class="flex items-center">
            <input
              id="access"
              name="notification-method"
              type="radio"
              checked
              class="h-4 w-4 border-gray-300 text-[#3043EB] focus:ring-[#3043EB] dark:focus:ring-[#3043EB]"
            />
            <label
              for="access"
              class="ml-3 block text-justify text-base font-normal text-white"
              >Pubic access (Open to everyone)</label
            >
          </div>
        </div>
      </div>
      <div class="flex items-start justify-between gap-4 pt-2.5">
        <MembershipOption
          clubName={'Your Club'}
          id={'1'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/hLD6byP/1.jpg'}
          usdcPrice={'32'}
          description={'Membership Description'}
          className={`w-[276px] h-[436px]`}
        />
        <MembershipOption
          clubName={'Your Club'}
          id={'2'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/Kyjr50C/Image.png'}
          usdcPrice={'32'}
          description={'Membership Description'}
          className={`w-[276px] h-[436px]`}
        />
        <MembershipOption
          clubName={'Your Club'}
          id={'3'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/nrdKDQy/Image-1.png'}
          usdcPrice={'32'}
          description={'Membership Description'}
          className={`w-[276px] h-[436px]`}
        />
      </div>
    </div>

    <!-- collection items -->
    <div class="w-full">
      <h1 class="mb-16 font-title text-2xl font-bold">Collection Items</h1>
      {#if isAdding}
        <div class="mb-16 flex items-start gap-16">
          <button
            type="button"
            class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white`}
          >
            + Add
          </button>

          <button
            type="button"
            class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white`}
          >
            Make items empty
          </button>
        </div>

        <div
          class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Name</span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <input
            class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
            id="collection-item-name"
            name="collection-item-name"
          />
        </div>

        <div
          class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Image</span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <label class="hs-form-field w-fit">
            <span
              class="hs-button is-filled is-large cursor-pointer rounded border-[3px] border-black px-8 py-6 font-bold text-white"
              >Upload to change</span
            >
            <input
              id="collection-item-image"
              name="collection-item-image"
              style="display:none"
              type="file"
              class="hs-button is-filled is-large cursor-pointer"
            />
          </label>
        </div>

        {#if !isTimeLimitedCollection}
          <div
            class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
          >
            <div class="m-0 w-full items-center p-0">
              <span class="mr-[13px] font-body">Max supply</span>
              <span class="font-body text-[#EB48F8]"> * </span>
            </div>
            <input
              class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
              id="collection-item-max-supply"
              name="collection-item-max-supply"
            />
          </div>
        {/if}

        <div
          class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Price</span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <input
            class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
            id="collection-item-price"
            name="collection-item-price"
          />
        </div>

        <div
          class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Description</span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <textarea
            class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
            id="collection-item-description"
            name="collection-item-description"
            rows="3"
          />
          <p class="text-xs">Markdown is available</p>
        </div>

        <div class="mb-16 flex items-start gap-16">
          <button
            type="button"
            class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white`}
          >
            Save
          </button>

          <button
            type="button"
            class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white`}
          >
            Make items empty
          </button>
        </div>
      {/if}
      <!-- Previous Memberships -->
      <div class="flex items-start justify-between gap-4">
        {#each memberships as mem}
          <MembershipOption
            clubName={name}
            id={mem.id}
            name={mem.name}
            imagePath={mem.imageSrc}
            usdcPrice={mem.price.toString()}
            description={mem.description}
            className={`w-[276px] h-[436px]`}
          />
        {/each}
      </div>
    </div>
  </div>
</form>
