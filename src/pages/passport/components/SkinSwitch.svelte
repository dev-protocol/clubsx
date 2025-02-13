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
    class="flex items-center justify-center gap-2 hs-button is-outlined !border border! w-fit"
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
    <div
      class="z-10 right-0 mt-2 grid gap-2 w-full min-w-80 absolute lg:w-96 animate-[fadein_0.2s_ease-out] p-8 rounded-xl bg-white/30 border border-white/70 backdrop-blur-md"
    >
      {#each skins as skin, i}
        <a
          href={isEditing
            ? `/passport/${eoa}/edit?skinId=${skin?.id}`
            : `/passport/${eoa}/${skin?.id}`}
          class="hs-button is-filled !rounded-full rounded-full! w-full text-center leading-normal line-clamp-1 z-50"
          >{skin?.name ?? `Passport ${i}`}</a
        >
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes -global-fadein {
    0% {
      transform: scale(0.9);
      opacity: 0%;
    }
    100% {
      transform: scale(1);
      opacity: 100%;
    }
  }
</style>
