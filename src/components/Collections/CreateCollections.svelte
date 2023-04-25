<script lang="ts">
  export let isTimeLimitedCollection: boolean = false

  const update = (e?: any) => {}
</script>

<form on:change|preventDefault={(e) => update(e)} class="w-full">
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
    class="mb-[62px] flex w-[99.1%] flex-col items-start justify-start gap-[7px]"
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
</form>
