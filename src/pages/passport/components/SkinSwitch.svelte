<script lang="ts">
  import type { Skin } from '@pages/api/profile'

  export let eoa: string = ''
  export let skins: Skin[] = []
  export let isEditing: boolean = false
  export let selectedSkinId: string = ''

  let isDropdownVisible: boolean = false

  const toggleDropdownVisibility = () => {
    isDropdownVisible = !isDropdownVisible
  }
</script>

<div class="relative">
  <button
    class="flex items-center justify-center gap-2 hs-button is-filled w-fit"
    disabled={!skins?.length}
    on:click={() => toggleDropdownVisibility()}
  >
    {#if skins.length > 1}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-4"
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
    {/if}
    <p class="font-bold line-clamp-1">
      {selectedSkinId
        ? (skins?.find((item) => item.id === selectedSkinId)?.name ?? 'Default')
        : (skins?.at(0)?.name ?? 'Default')}
    </p>
  </button>

  {#if isDropdownVisible}
    <div class="left-0 mt-2 grid gap-[1px] w-full lg:absolute lg:w-96">
      {#each skins as skin, i}
        <a
          href={isEditing
            ? `/passport/${eoa}/edit?skinId=${skin?.id}`
            : `/passport/${eoa}/${skin?.id}`}
          class="hs-button is-filled w-full text-center leading-normal line-clamp-1 z-50"
          >{skin?.name ?? `Passport ${i}`}</a
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
