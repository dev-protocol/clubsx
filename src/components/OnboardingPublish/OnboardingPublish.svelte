<script lang="ts">
  import { onMount } from 'svelte'
  import { i18nFactory } from '@devprotocol/clubs-core'

  import { Strings } from './i18n'

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  let clubsName: string = ''
  let tokenName: string = ''
  let tokenSymbol: string = ''

  onMount(() => {
    i18n = i18nBase(navigator.languages)
  })
</script>

<div
  class="relative flex flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto"
>
  <!-- Hero Header -->
  <section class="my-16 grid gap-8 md:my-32 min-w-full w-full max-w-full">
    <h1 class="text-2xl font-bold md:text-5xl text-center">{i18n('Header')}</h1>
    <!-- <p>{i18n('SubHeader')}</p> -->
    <!-- When want to add this to future we need to add translation and uncomment code of this line. -->
  </section>

  <!-- Inputs -->
  <section class="grid gap-8 w-full max-w-full">
    <!-- Clubs name -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Club name</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={clubsName}
        id="clubs-name"
        name="clubs-name"
      />
    </label>

    <!-- Token name -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Token name</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={tokenName}
        id="token-name"
        name="token-name"
      />
      <p class="hs-form-field__helper mt-2">
        * The full name of the token. Example: Uniswap.
      </p>
    </label>

    <!-- Token symbol -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Token symbol</span>
      <input
        class="hs-form-field__input w-full"
        bind:value={tokenSymbol}
        id="token-symbol"
        name="token-symbol"
      />
      <p class="hs-form-field__helper mt-2">
        * The abbrevation of the token. Example: UNI.
      </p>
    </label>
  </section>
</div>
