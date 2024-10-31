<script lang="ts">
  import { onMount } from 'svelte'
  import { JsonRpcProvider } from 'ethers'
  import { i18nFactory } from '@devprotocol/clubs-core'
  import { type UndefinedOr } from '@devprotocol/util-ts'
  import type { Profile, Skin } from '@pages/api/profile'
  import Skeleton from '@components/Global/Skeleton.svelte'

  import { Strings } from '../i18n'
  import type { PassportItem } from '../types'
  import PassportAsset from './PassportAsset.svelte'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  export let skinIndex = 0
  export let isLocal: boolean
  export let profileFetching = true
  export let profileUpdating = false
  export let passportItemsFetching = true
  export let profile: Profile = {} as Profile
  export let profileFromAPI: Profile = profile
  export let eoa: UndefinedOr<string> = undefined
  export let passportSkinItems: PassportItem[] = []

  const rpcProvider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.PUBLIC_ALCHEMY_KEY ?? ''}`,
  )

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
  })

  const selectSkinTheme = (item: PassportItem) => {
    if (!item.payload) {
      return
    }

    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.
          theme: item.payload, // Update only theme value.
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }
  }

  const undoSkinThemeUpdate = () => {
    profile = {
      ...profile, // Retain other modified fields.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // keep all the other skins before skinIndex.

        {
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)), // Retain other skin properties irrespective of whether the skin is modified or not.

          // Reset only theme value below.
          ...(profileFromAPI?.skins?.length && // If profileFromAPI, skins, skins.length, skins.at, thme any return falsy we get empty value.
          profileFromAPI?.skins?.at(skinIndex)?.theme
            ? { theme: profileFromAPI.skins[skinIndex].theme } // Since we have validated all- profileFromAPI, skins, skins.length > 0, skins.at(0), theme
            : {}), // Otherwise set it to empty
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // keep all the other skins after skinIndex.
      ],
    }
  }
</script>

<!-- Passport skin theme -->
<div class="w-full">
  <label class="hs-form-field is-filled mt-[76px]">
    <div class="hs-form-field__label flex items-center justify-between mb-1">
      <span class="hs-form-field__label">
        {i18n('PassportSkin')} ({passportSkinItems?.length ?? 0})
      </span>

      <button
        disabled={!eoa ||
          !passportSkinItems.length ||
          profileFetching ||
          passportItemsFetching ||
          profileUpdating}
        on:click|preventDefault={() => undoSkinThemeUpdate()}
        class="hs-button is-filled is-large w-fit text-center">Reset</button
      >
    </div>

    {#if !eoa}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('ConnectWalletTryAgain')} :)
      </div>
    {:else if passportItemsFetching}
      <div
        class="rounded-md border border-surface-400 p-8 text-accent-200 h-48"
      >
        <Skeleton />
      </div>
    {:else if !passportItemsFetching && !passportSkinItems?.length}
      <div class="rounded-md border border-surface-400 p-8 text-accent-200">
        {i18n('Empty')} :) <br />{@html i18n('PurchasePassportSkin')}
      </div>
    {:else if !passportItemsFetching && passportSkinItems?.length}
      <ul class="grid gap-16 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {#each passportSkinItems as item, i}
          <li id={`assetsPassportItems-${i.toString()}`} class="empty:hidden">
            <button
              disabled={!eoa ||
                !passportSkinItems.length ||
                profileFetching ||
                passportItemsFetching ||
                profileUpdating}
              on:click|preventDefault={() => selectSkinTheme(item)}
            >
              <PassportAsset
                props={{
                  item,
                  provider: rpcProvider,
                  local: isLocal,
                  classNames:
                    profile.skins?.at(skinIndex)?.theme === item.payload
                      ? 'border-2 border-surface-ink'
                      : 'border border-surface-300',
                }}
              />
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </label>
</div>
