<script lang="ts">
  import { onMount } from 'svelte'

  import { i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from '../i18n'
  import Achievement from '../assets/achievement.svg'

  export let achievementId: string = ''

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<section
  class="flex flex-col rounded-2xl p-4 gap-8 items-center shadow bg-dp-white-200 text-dp-white-ink"
>
  <h2 class="text-4xl font-bold">
    {i18n('Achievement')} #{achievementId}
  </h2>

  <div
    class="rounded-[19px] p-4 border-[1px] min-w-[41%] w-[41%] max-w-full border-black/20 bg-black/10"
  >
    <img
      src={Achievement.src}
      alt="Achievements UI"
      class="h-auto w-full rounded-[7px] object-cover object-center sm:h-full sm:w-full"
    />
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full">
    <div
      class="w-full px-8 py-6 mb-2.5 hs-button is-filled cursor-pointer rounded font-bold text-3xl border-[3px]"
    >
      Claim
    </div>
    <p class="text-center w-full text-xl font-medium text-black">
      Sign to claim the achievement.
    </p>
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full text-3xl font-medium">
    Achievement Name
  </div>

  <div
    class="min-w-[41%] w-[41%] max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal"
  >
    It is a long established fact that a reader will be distracted by the
    readable content of a page when looking at its layout. The point of using
    Lorem Ipsum is that it has a more-or-less normal distribution of letters, as
    opposed to using 'Content here, content here', making it look like readable
    English. Many desktop publishing packages and web page editors now use Lorem
    Ipsum as their default model text, and a search for 'lorem ipsum' will
    uncover many web sites still in their infancy. Various versions have evolved
    over the years, sometimes by accident, sometimes on purpose (injected humour
    and the like).
  </div>

  <div class="min-w-[41%] w-[41%] max-w-full text-3xl font-medium">
    Metadata
  </div>

  <section
    class="min-w-[41%] w-[41%] max-w-full p-2.5 rounded-md bg-[#F1F1F1] text-base font-normal flex flex-col items-start gap-4"
  >
    <div class="flex w-full justify-between items-start">
      <p class="text-base font-normal">Trait_type_name</p>
      <p class="text-base font-bold">The_value</p>
    </div>

    <div class="flex w-full justify-between items-start">
      <p class="text-base font-normal">Trait_type_name</p>
      <p class="text-base font-bold">The_value</p>
    </div>

    <div class="flex w-full justify-between items-start">
      <p class="text-base font-normal">Trait_type_name</p>
      <p class="text-base font-bold">The_value</p>
    </div>

    <div class="flex w-full justify-between items-start">
      <p class="text-base font-normal">Trait_type_name</p>
      <p class="text-base font-bold">The_value</p>
    </div>
  </section>
</section>
