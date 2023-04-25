<script lang="ts">
  const update = (e?: any) => {}
</script>

<form on:change|preventDefault={(e) => update(e)} class="w-full">
  <div class="w-full">
    <div
      class="mb-[62px] flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="m-0 w-full items-center p-0">
        <span class="mr-[13px] font-body"> Collection name </span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <input
        class="w-full rounded border-[3px] border-black bg-[#040B10] px-8 py-6"
        id="hero-image"
        name="hero-image"
      />
    </div>
  </div>
</form>
