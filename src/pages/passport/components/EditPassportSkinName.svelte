<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let skinIndex = 0
  export let profileUpdating = false
  export let profileFetching = true
  export let profile: Profile = {} as Profile
  export let profileFromAPI: Profile = profile
  export let eoa: UndefinedOr<string> = undefined

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const onChangePassportSkinName = (ev: Event) => {
    const newName =
      (event?.target as HTMLInputElement)?.value ??
      profile?.skins?.at(skinIndex)?.name ??
      profileFromAPI?.skins?.at(skinIndex)?.name ??
      ''

    profile = {
      ...profile,
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          name: newName,
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }
  }
</script>

<!-- Passport skin name -->
<div class="w-full">
  <label class="hs-form-field is-filled mt-16">
    <span class="hs-form-field__label"> {i18n('PassportName')} </span>
    <input
      class="hs-form-field__input"
      disabled={profileUpdating || !eoa || profileFetching}
      value={profile?.skins?.at(skinIndex)?.name ?? ''}
      on:change|preventDefault={onChangePassportSkinName}
      placeholder={i18n('PassportSkinNamePlaceholder')}
    />
    <span class="hs-form-field__helper">
      {i18n('PassportNameHelper')}
    </span>
  </label>
</div>
