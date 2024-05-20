<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from '../i18n'

  export let name: string = 'Clubs'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<h2 class="text-center text-xl font-bold lg:text-4xl">
  {i18n('About', [name])}
</h2>
