<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import type { DraftOptions } from '@constants/draft'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { type Signer, type ContractRunner, ZeroAddress, isAddress } from 'ethers'
  import { createPropertyContract } from '@devprotocol/dev-kit'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import {
    decode,
    encode,
    i18nFactory,
    type ClubsConfiguration,
    type ClubsPluginOption,
  } from '@devprotocol/clubs-core'

  import { Strings } from './i18n'
  import SvgShining from './SvgShining.svelte'

  export let domain: string
  export let previewImgSrc: string
  export let config: ClubsConfiguration
  export let tokenizedPropertyAddress: string = ''

  let clubsName: string
  let tokenName: string
  let tokenSymbol: string

  const I18_BASE = i18nFactory(Strings)

  let isPublished = false
  let i18n = I18_BASE(['en'])
  let signer: Signer | undefined
  let isPublishingClub = false
  let isErrorInPublishClub = false
  let connection: typeof Connection
  let provider: ContractRunner | undefined
  let tokenizationResult: UndefinedOr<true | Error>

  $: {
    if (tokenizationResult === true) {
      // If the modal is open, page scrolling should be disabled.
      document.body.classList.toggle('overflow-hidden')
    }
  }

  const saveConfigOnClubs = async ({
    config: _config,
    sig,
    msg,
  }: {
    config: ClubsConfiguration
    sig: string
    msg: string
  }) => {
    const encodedConfig = encode(_config)
    const body = {
      sig,
      hash: msg,
      config: encodedConfig,
      site: domain,
    }

    const res = await fetch('/api/updateDraftConfig', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const result = res?.ok
      ? true
      : new Error(await res.json().then((r) => r.error))

    return result
  }

  const updateConfig = async () => {
    isPublished = false
    isPublishingClub = true
    isErrorInPublishClub = false

    if (!tokenizedPropertyAddress) {
      console.error('Property address undefined in updateConfig!')
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }

    if (!signer || !provider) {
      console.error('Signer or provider undefined in updateConfig!')
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }

    const __draftOptions: DraftOptions | undefined = config?.options?.find(
      (op: ClubsPluginOption) => op.key === '__draft',
    ) as DraftOptions
    if (!__draftOptions) {
      console.error('Draft options not found!')
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }

    const __updatedDraftOptions: DraftOptions = {
      ...__draftOptions,
      value: { ...__draftOptions.value, isInDraft: false },
    }
    if (!__updatedDraftOptions) {
      console.error('Updated draft options not found!')
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }

    const nextConfig: ClubsConfiguration = {
      ...config,
      propertyAddress: tokenizedPropertyAddress,
      options: [
        ...(config.options
          ? [
              ...config.options.filter((op) => op.key !== '__draft'),
              __updatedDraftOptions,
            ]
          : []),
      ],
    }

    const hash = `Updating config with tokenized property address:${tokenizedPropertyAddress} @ts:${new Date().getTime()}`
    let sig: string
    try {
      sig = await signer.signMessage(hash)
    } catch (error) {
      console.error('Error', error)
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }
    if (!sig) {
      console.error('Sig not found!')
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
      return
    }

    const tokenizationResult = await saveConfigOnClubs({
      config: nextConfig,
      sig: sig,
      msg: hash,
    })

    if (tokenizationResult && !(tokenizationResult instanceof Error)) {
      isPublished = true
      isPublishingClub = false
      isErrorInPublishClub = false
      sessionStorage.removeItem(`${domain}-onboarding-data`)
    } else {
      isPublished = false
      isPublishingClub = false
      isErrorInPublishClub = true
    }
  }

  const fetchPublishDetails = async () => {
    const __draftOptions: DraftOptions | undefined = config?.options?.find(
      (op: ClubsPluginOption) => op.key === '__draft',
    ) as DraftOptions
    if (
      __draftOptions &&
      __draftOptions.value.isInDraft === false &&
      config.propertyAddress &&
      config.propertyAddress != ZeroAddress &&
      isAddress(config.propertyAddress)
    ) {
      sessionStorage.removeItem(`${domain}-onboarding-data`)
      isPublished = true
      tokenizationResult = true
    }

    const rawData = sessionStorage.getItem(`${domain}-onboarding-data`)
    if (!rawData) {
      clubsName = ''
      tokenName = ''
      tokenSymbol = ''
      return
    }

    const onboardingData = JSON.parse(
      window.atob(decodeURIComponent(decode(rawData))),
    )

    clubsName = onboardingData.clubsName
    tokenName = onboardingData.tokenName
    tokenSymbol = onboardingData.tokenSymbol
  }

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection

    signer = connection().signer.getValue()
    provider = connection().provider.getValue()

    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().provider.subscribe((p) => {
      provider = p
    })
  }

  $: (async () => {
    if (!tokenizedPropertyAddress) {
      console.error('Property address not passed!')
      return
    }

    if (!provider || !signer) {
      console.error('Provider or signer not found!', provider, signer)
      return
    }

    const propertyContract = createPropertyContract(provider)(
      tokenizedPropertyAddress,
    )
    if (!propertyContract) {
      console.log('Property contract not found!')
      return
    }

    tokenName = (await propertyContract.name()) ?? ''
    tokenSymbol = (await propertyContract.symbol()) ?? ''
  })()

  onMount(() => {
    i18n = I18_BASE(navigator.languages)

    connectOnMount()
    fetchPublishDetails()
  })

  const getAdminUrl = () => {
    const { protocol, host } = new URL(location.href)
    return `${protocol}//${domain}.${host}/admin/theme`
  }
</script>

<div
  class="relative flex gap-16 flex-col justify-center p-4 md:p-0 max-w-screen-sm container mx-auto"
>
  <!-- Hero Header -->
  <section class="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
    <h1 class="text-2xl font-bold md:text-5xl text-center">{i18n('Header')}</h1>
    <!-- When want to add this to future we need to add translation and uncomment code of this line. -->
    <!-- <p>{i18n('SubHeader')}</p> -->
  </section>

  <!-- Core inputs -->
  <section class="grid gap-8 md:gap-16 w-full max-w-full mb-16 md:mb-32">
    <!-- Clubs name -->
    <div class="hs-form-field is-filled">
      <span class="hs-form-field__label !text-accent-400"
        >{i18n('ClubNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-accent-400">
        {clubsName}
      </p>
    </div>

    <!-- Token name -->
    <div class="hs-form-field is-filled">
      <span class="hs-form-field__label !text-accent-400"
        >{i18n('TokenNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-accent-400">
        {tokenName}
      </p>
    </div>

    <!-- Token symbol -->
    <div class="hs-form-field is-filled">
      <span class="hs-form-field__label !text-accent-400"
        >{i18n('TokenSymbolLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-accent-400">
        {tokenSymbol}
      </p>
    </div>

    <!-- Token supply -->
    <div class="hs-form-field is-filled">
      <p class="font-body font-bold text-[32px] !text-accent-400">
        10,000,000 {tokenSymbol}
      </p>
      <span class="hs-form-field__label !text-accent-400"
        >{i18n('TokenSupply')}</span
      >
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer &&
        clubsName &&
        tokenName &&
        tokenSymbol &&
        tokenizedPropertyAddress
          ? isPublishingClub
            ? 'animate-pulse bg-gray-500/60'
            : ''
          : 'opacity-30'
      }`}
    >
      <p class="font-normal text-base text-white">{i18n('CreateASig')}</p>
      <button
        disabled={!signer ||
          isPublishingClub ||
          !clubsName ||
          !tokenName ||
          !tokenSymbol ||
          !tokenizedPropertyAddress}
        class={`hs-button is-filled px-8 py-4 ${
          isPublishingClub ? 'animate-pulse bg-gray-500/60' : ''
        } ${!signer || !clubsName || !tokenName || !tokenSymbol || !tokenizedPropertyAddress ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) => updateConfig()}
      >
        {i18n('Publish', [
          isPublishingClub ? 'Yes' : '',
          isErrorInPublishClub ? 'Yes' : '',
        ])}
      </button>
    </div>
  </section>
</div>

{#if tokenizationResult === true}
  <div
    role="dialog"
    class="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-md"
    transition:fade={{ duration: 100 }}
  >
    <SvgShining
      className="fixed animate-[spin_15s_linear_infinite] h-full min-h-[200dvh]"
    />
    <div
      class="relative rounded-2xl bg-white container max-w-screen-md flex flex-col justify-center p-8 gap-8 border"
      transition:fly={{ y: 500 }}
    >
      <h1 class="text-2xl font-bold italic text-black text-center">
        {clubsName} is now live!
      </h1>
      <div
        class="relative rounded-xl flex justify-center items-center overflow-hidden py-20"
      >
        <img
          src={previewImgSrc}
          alt=""
          class="w-full h-full object-cover absolute inset-0 opacity-20"
        />
        <a
          href={getAdminUrl()}
          class="hs-button is-large is-filled relative bg-surface-600 hover:bg-surface-400 text-surface-ink rounded-xl"
          ><span class="text-2xl font-bold">Open your admin panel</span></a
        >
      </div>
    </div>
  </div>
{/if}
