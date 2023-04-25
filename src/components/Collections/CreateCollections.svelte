<script lang="ts">
  import type { Membership } from '@plugins/memberships'

  export let memberships: Membership[] = []
  export let isTimeLimitedCollection: boolean = false

  const update = (e?: any) => {}
</script>

<form on:change|preventDefault={(e) => update(e)} class="w-full">
  <div class="w-full max-w-full">
    <div
      class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body">Collection name </span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <input
        class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="collection-name"
        name="collection-name"
      />
    </div>

    <div
      class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body">Collection cover image</span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <label class="hs-form-field w-fit">
        <span
          class="hs-button is-filled is-large cursor-pointer rounded border-[3px] border-black px-8 py-6 font-bold text-white"
          >Upload to change</span
        >
        <input
          id="collection-cover-image"
          name="collection-cover-image"
          style="display:none"
          type="file"
          class="hs-button is-filled is-large cursor-pointer"
        />
      </label>
    </div>

    <div
      class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body">Start date</span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <input
        type="datetime-local"
        class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="collectino-start-date"
        name="collection-start-date"
      />
    </div>

    {#if isTimeLimitedCollection}
      <div
        class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
      >
        <div class="m-0 w-full items-center p-0">
          <span class="mr-[13px] font-body">End date</span>
          <span class="font-body text-[#EB48F8]"> * </span>
        </div>
        <input
          type="datetime-local"
          class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
          id="collection-end-date"
          name="collection-end-date"
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

    <div
      class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[13px]"
    >
      <span class="font-body">Allowlist</span>
      <div
        class="grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-16"
      >
        {#each memberships as mem}
          <label>
            <input
              type="checkbox"
              name="membershipAllowList"
              value={mem.id}
              class="hidden"
            />
            <div
              class={`flex flex-col gap-4 rounded-[5px] bg-white p-2.5 text-black`}
            >
              <span class="text-xl font-bold">{mem.name}</span>
              <img
                class="aspect-square w-full rounded-[5px]"
                src={mem.imageSrc}
                alt={`${mem.name} Membership`}
              />
              <span class="text-xl font-bold"
                >{mem.price} {mem.currency.toUpperCase()}</span
              >
              <span class="text-base">{mem.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <div class="w-full">
    <h1 class="mb-16 font-title text-2xl font-bold">Collection Items</h1>
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

    <div
      class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[13px]"
    >
      <span class="font-body">Allowlist</span>
      <div
        class="grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-between gap-16"
      >
        {#each memberships as mem}
          <div class="flex flex-col items-center gap-4">
            <label>
              <input
                type="checkbox"
                name="membershipAllowList"
                value={mem.id}
                class="hidden"
              />
              <div
                class={`flex flex-col gap-4 rounded-[5px] bg-white p-2.5 text-black`}
              >
                <span class="text-xl font-bold">{mem.name}</span>
                <img
                  class="aspect-square w-full rounded-[5px]"
                  src={mem.imageSrc}
                  alt={`${mem.name} Membership`}
                />
                <span class="text-xl font-bold"
                  >{mem.price} {mem.currency.toUpperCase()}</span
                >
                <span class="text-base">{mem.description}</span>
              </div>
            </label>
            <button
              type="button"
              class={`hs-button is-large is-filled w-full rounded px-8 py-6 text-base font-bold text-white`}
            >
              Edit
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</form>
