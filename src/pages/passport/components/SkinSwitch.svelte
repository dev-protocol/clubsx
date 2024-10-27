<script lang="ts">
  import type { Skin } from '@pages/api/profile'

  export let eoa: string = ''
  export let skins: Skin[] = []
  export let selectedSkinId: string = ''

  let dropdownVisible: boolean = false

  const toggleSelectedPassportSkins = () => {
    dropdownVisible = !dropdownVisible
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
        {skins?.find((item) => item.id === selectedSkinId)?.name ?? 'Default'}
      </div>
      {#if dropdownVisible}
        <ul class="">
          {#each skins as skin, i}
            <li>
              <a
                href={`/passport/${eoa}/${skin?.id}`}
                class="overflow-hidden text-black truncate font-sans text-base font-bold leading-normal line-clamp-1"
                >{skin?.name ?? `Profile ${i}`}</a
              >
            </li>
          {/each}
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
