<script lang="ts">
  import type { Skin } from '@pages/api/profile'

  export let eoa: string = ''
  export let skins: Skin[] = []
  export let isEditing: boolean = false
  export let selectedSkinId: string = ''

  let dropdownVisible: boolean = false

  const toggleSelectedPassportSkins = () => {
    dropdownVisible = !dropdownVisible
  }
</script>

<div class="relative">
  <div
    class="flex items-center gap-[15px] hs-button is-filled is-large w-fit text-center"
  >
    <button on:click={() => toggleSelectedPassportSkins()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <p class="font-sans text-base font-bold leading-normal line-clamp-1">
      {skins?.find((item) => item.id === selectedSkinId)?.name ?? 'Default'}
    </p>
  </div>

  {#if dropdownVisible}
    <div class="absolute left-0 mt-2 grid gap-[1px] w-full max-w-full">
      {#each skins as skin, i}
        <a
          href={isEditing
            ? `/passport/${eoa}/edit?skinId=${skin?.id}`
            : `/passport/${eoa}/${skin?.id}`}
          class="hs-button is-filled is-large w-full text-center leading-normal line-clamp-1 z-50"
          >{skin?.name ?? `Profile ${i}`}</a
        >
      {/each}
    </div>
  {/if}
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
