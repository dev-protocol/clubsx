<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from './i18n'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">
      {i18n('Header')}
    </h1>
    <!-- <p>{ i18n('SubHeader') }</p> -->
  </section>

  <div class="grid justify-center gap-16 md:gap-32">
    <section></section>
  </div>
</div>
