<script lang="ts">
  let dropdownVisible: boolean = false

  const toggleSelectedPassportSkins = () => {
    console.log('Button Clicked!')
    dropdownVisible = !dropdownVisible
    console.log(dropdownVisible)
  }
</script>

<div class="grow">
  <div class="ml-4">
    <div class="flex py-2 px-4 items-center gap-[15px] rounded-md bg-white">
      <div class="relative">
        <button on:click={() => toggleSelectedPassportSkins()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        class="overflow-hidden text-black truncate font-sans text-base font-bold leading-normal line-clamp-1"
      >
        Main Passport (Mystic Horizon)
      </div>
      {#if dropdownVisible}
        <ul class="">
          <li>
            <a
              href="#item1"
              class="overflow-hidden text-black truncate font-sans text-base font-bold leading-normal line-clamp-1"
              >Menu Item 1</a
            >
          </li>
          <li>
            <a
              href="#item2"
              class="overflow-hidden text-black truncate font-sans text-base font-bold leading-normal line-clamp-1"
              >Menu Item 2</a
            >
          </li>
          <li>
            <a
              href="#item3"
              class="overflow-hidden text-black truncate font-sans text-base font-bold leading-normal line-clamp-1"
              >Menu Item 3</a
            >
          </li>
        </ul>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes -global-up {
    0% {
      transform: translateY(0);
      opacity: 100%;
    }
    80% {
      transform: translateY(-50%);
    }
    100% {
      transform: translateY(-52%);
      opacity: 0%;
    }
  }
</style>
