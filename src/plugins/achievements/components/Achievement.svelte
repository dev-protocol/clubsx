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
  class="flex flex-col rounded-xl bg-dp-white-200 p-4 text-dp-white-ink shadow items-center gap-8"
>
  <h2 class="mb-4 text-4xl font-bold">
    {i18n('Achievement')} #{achievementId}
  </h2>

  <div
    class="rounded-[19px] p-4 border-[0.7px] min-w-[41%] w-[41%] max-w-full border-black/20 bg-black/10"
  >
    <img
      src={Achievement.src}
      alt="Achievements UI"
      class="h-auto w-full rounded-[7px] object-cover object-center sm:h-full sm:w-full"
    />
  </div>
</section>
