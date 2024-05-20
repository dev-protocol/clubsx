<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from '../i18n'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<div
  class="mx-auto my-8 w-full max-w-2xl rounded-lg bg-black/10 p-6 text-center"
>
  <h2 class="text-xl font-bold lg:text-4xl">
    {i18n('WaitForLaunch')}
  </h2>
</div>
