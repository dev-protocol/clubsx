<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import type { PassportItem } from '../types'
  import { bytes32Hex, i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from '../i18n'
  import { onMount } from 'svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let profile: Profile
  export let skinId: UndefinedOr<string> = undefined
  export let purchasedSkinThemes: PassportItem[] = []
  export let className = ''

  let thisSkin: UndefinedOr<Skin>
  let current: UndefinedOr<PassportItem>

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  $: {
    thisSkin = profile.skins?.find((x) => x.id === skinId)
    current = purchasedSkinThemes.find(
      (x) => bytes32Hex(x.payload ?? '') === thisSkin?.theme,
    )
  }
</script>

<div class={`grid grid-flow-col items-center justify-start gap-2 ${className}`}>
  {#if thisSkin?.name}
    <p class="truncate text-xs">
      {thisSkin?.name}
    </p>
  {:else}
    <p class="truncate text-xs opacity-20">( No name )</p>
  {/if}
  <p>·</p>
  {#if current}
    <p class="truncate text-xs">{i18n('CustomSkinSet')}</p>
  {:else}
    <p class="truncate text-xs opacity-20">{i18n('NoCustomSkinSet')}</p>
  {/if}
</div>
