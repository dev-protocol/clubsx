<script lang="ts">
  import { onMount } from 'svelte'
  import { sign } from '@devprotocol/khaos-kit'
  import type { DraftOptions } from '@constants/draft'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { NetworkName } from '@devprotocol/khaos-core'
  import { addresses, marketAddresses } from '@devprotocol/dev-kit'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import {
    type Signer,
    type ContractRunner,
    ZeroAddress,
    isAddress,
  } from 'ethers'
  import {
    decode,
    encode,
    i18nFactory,
    type ClubsConfiguration,
    type ClubsPluginOption,
  } from '@devprotocol/clubs-core'
  import {
    createMarketBehaviorContract,
    createMarketContract,
    createPropertyFactoryContract,
  } from '@devprotocol/dev-kit/l2'

  import { Market } from './types'
  import { Strings } from './i18n'
  import SvgShining from './SvgShining.svelte'
  import { fade, fly } from 'svelte/transition'
  import { selectMarketAddressOption } from './utils'

  export let domain: string
  export let previewImgSrc: string
  export let config: ClubsConfiguration

  let market: Market
  let clubsName: string
  let tokenName: string
  let assetName: string
  let tokenSymbol: string
  let khaosMessage: string
  let khaosSignature: string
  let personalAccessToken: string

  const I18_BASE = i18nFactory(Strings)
  const NETWORK_NAME: string = 'polygon-mainnet'

  let i18n = I18_BASE(['en'])
  let signer: Signer | undefined
  let connection: typeof Connection
  let khaosPubSign: string | undefined
  let propertyAddress: string | undefined
  let provider: ContractRunner | undefined
  let isCreatingKhaosPubSign: boolean = false
  let isCreatingPropertyAddr: boolean = false
  let tokenizationResult: UndefinedOr<true | Error>
  let createKhaosPubSignFdTxt: string = i18n('Sign')
  let createProertyAddrFdTxt: string = i18n('Tokenize')

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

  const updateConfig = async (propertyAddress: string) => {
    isCreatingPropertyAddr = true
    createProertyAddrFdTxt = i18n('Publishing')

    if (!propertyAddress || !signer || !provider) {
      isCreatingPropertyAddr = false
      createProertyAddrFdTxt = i18n('ConnectWallet')
      return
    }

    const __draftOptions: DraftOptions | undefined = config?.options?.find(
      (op: ClubsPluginOption) => op.key === '__draft',
    ) as DraftOptions
    if (!__draftOptions) {
      isCreatingPropertyAddr = false
      createProertyAddrFdTxt = i18n('ClubsNotInDraft')
      return
    }

    const __updatedDraftOptions: DraftOptions = {
      ...__draftOptions,
      value: { ...__draftOptions.value, isInDraft: false },
    }
    if (!__updatedDraftOptions) {
      isCreatingPropertyAddr = false
      createProertyAddrFdTxt = i18n('ClubsNotInDraft')
      return
    }

    const nextConfig: ClubsConfiguration = {
      ...config,
      propertyAddress,
      options: [
        ...(config.options
          ? [
              ...config.options.filter((op) => op.key !== '__draft'),
              __updatedDraftOptions,
            ]
          : []),
      ],
    }

    tokenizationResult = await saveConfigOnClubs({
      config: nextConfig,
      sig: khaosSignature,
      msg: khaosMessage,
    })

    // Clear session storage (which contains PAT) when tokenization is succesfull.
    if (tokenizationResult && !(tokenizationResult instanceof Error)) {
      isCreatingPropertyAddr = false
      createProertyAddrFdTxt = i18n('Published')
      sessionStorage.removeItem(`${domain}-onboarding-data`)
    } else {
      isCreatingPropertyAddr = false
      createProertyAddrFdTxt = i18n('PublishError')
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
      tokenizationResult = true
      return
    }

    const rawData = sessionStorage.getItem(`${domain}-onboarding-data`)
    if (!rawData) {
      clubsName = ''
      tokenName = ''
      assetName = ''
      tokenSymbol = ''
      personalAccessToken = ''
      return
    }

    const onboardingData = JSON.parse(
      window.atob(decodeURIComponent(decode(rawData))),
    )
    market = onboardingData.market
    clubsName = onboardingData.clubsName
    tokenName = onboardingData.tokenName
    assetName = onboardingData.assetName
    tokenSymbol = onboardingData.tokenSymbol
    personalAccessToken = onboardingData.personalAccessToken
  }

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection
    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().provider.subscribe((p) => {
      provider = p
    })
  }

  onMount(() => {
    i18n = I18_BASE(navigator.languages)

    connectOnMount()
    fetchPublishDetails()
  })

  const setKhaosPubSignStates = async (
    sign: string | undefined,
    toggle: boolean,
    feedback: string,
  ) => {
    khaosPubSign = sign
    isCreatingKhaosPubSign = toggle
    createKhaosPubSignFdTxt = feedback
    console.log('Feedback: ', feedback)
  }

  const createKhaosPubSign = async (
    personalAccessToken: string,
    assetName: string,
    signId: string = 'github-market',
  ) => {
    try {
      setKhaosPubSignStates(undefined, true, i18n('Signing'))

      if (!provider || !signer) {
        setKhaosPubSignStates(undefined, false, i18n('ConnectWallet'))
        return
      }

      let signMessage: string
      try {
        signMessage = await signer.signMessage(assetName)
      } catch (error) {
        console.error('Error', error)
        setKhaosPubSignStates(undefined, false, i18n('TxnRejected'))
        return
      }
      if (!signMessage) {
        console.error('Sig not found!')
        setKhaosPubSignStates(undefined, false, i18n('SignError'))
        return
      }

      khaosMessage = assetName
      khaosSignature = signMessage
      const signerFn = sign(signId, NETWORK_NAME as NetworkName)
      const _khaosPubSign = await signerFn({
        signature: signMessage,
        secret: decode(personalAccessToken),
        message: assetName,
      })

      setKhaosPubSignStates(
        _khaosPubSign
          ? (_khaosPubSign?.publicSignature ?? undefined)
          : undefined,
        false,
        _khaosPubSign ? i18n('Signed') : i18n('SignError'),
      )
      return
    } catch (err) {
      console.log('Err', err)
      setKhaosPubSignStates(undefined, false, i18n('SignError'))
      return
    }
  }

  const setCreateAndAuthenticateStates = async (
    addr: string | undefined,
    toggle: boolean,
    feedback: string,
  ) => {
    propertyAddress = addr
    isCreatingPropertyAddr = toggle
    createProertyAddrFdTxt = feedback
    console.log('Feedback: ', feedback)
  }

  const createAndAuthenticate = async (
    selectedMarket: Market,
    assetName: string,
  ) => {
    try {
      setCreateAndAuthenticateStates(undefined, true, i18n('Tokenizing'))

      if (!provider || !signer) {
        setCreateAndAuthenticateStates(undefined, false, i18n('ConnectWallet'))
        return
      }
      if (!khaosPubSign) {
        setKhaosPubSignStates(undefined, false, i18n('Sign'))
        setCreateAndAuthenticateStates(undefined, false, i18n('TokenizeError'))
        return
      }

      const userAddr: string = await signer.getAddress()
      const propertyFactoryContract = createPropertyFactoryContract(provider)(
        addresses.polygon.mainnet.propertyFactory,
      )
      if (!propertyFactoryContract) {
        setCreateAndAuthenticateStates(undefined, false, i18n('TokenizeError'))
        return
      }

      const marketAddr = selectMarketAddressOption(
        selectedMarket,
        marketAddresses.polygon.mainnet,
      )
      if (!marketAddr) {
        setCreateAndAuthenticateStates(undefined, false, i18n('TokenizeError'))
        return
      }

      const marketContract = createMarketContract(provider)(marketAddr)
      const marketBehavior = createMarketBehaviorContract(provider)(
        await marketContract.behavior(),
      )
      const metricsAddress = await marketBehavior.getMetrics(assetName) // e.g github repo name or youtube channel id.
      if (metricsAddress === ZeroAddress) {
        const created = await propertyFactoryContract.createAndAuthenticate(
          tokenName,
          tokenSymbol,
          marketAddr,
          [assetName, khaosPubSign],
          {
            metricsFactoryAddress: addresses.polygon.mainnet.metricsFactory,
          },
          {
            fallback: {
              from: userAddr,
              // value from stake.social createAndAuthenticate
              // should this be more dynamic based on network?
              gasLimit: 2000000,
            },
          },
        )
        console.log('Property created, waiting for authentication!')
        await created.waitForAuthentication()
        setCreateAndAuthenticateStates(
          created.property,
          false,
          i18n('Tokenized'),
        )
        updateConfig(created.property)
        return
      } else {
        setCreateAndAuthenticateStates(undefined, false, i18n('TokenizeError'))
        return
      }
    } catch (err) {
      console.log('Err', err)
      setCreateAndAuthenticateStates(undefined, false, i18n('TokenizeError'))
    }
  }

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
        !khaosPubSign &&
        clubsName &&
        tokenName &&
        tokenSymbol &&
        assetName &&
        personalAccessToken
          ? isCreatingKhaosPubSign
            ? 'animate-pulse bg-gray-500/60'
            : ''
          : 'opacity-30'
      }`}
    >
      <p class="font-normal text-base text-white">{i18n('CreateASig')}</p>
      <button
        disabled={!signer ||
          !!khaosPubSign ||
          isCreatingKhaosPubSign ||
          isCreatingPropertyAddr ||
          !clubsName ||
          !tokenName ||
          !tokenSymbol ||
          !personalAccessToken ||
          !assetName ||
          !market}
        class={`hs-button is-filled px-8 py-4 ${
          isCreatingKhaosPubSign ? 'animate-pulse bg-gray-500/60' : ''
        } ${!signer || !!khaosPubSign || !clubsName || !tokenName || !tokenSymbol || !assetName || !personalAccessToken || !market ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) =>
          createKhaosPubSign(
            personalAccessToken,
            assetName,
            market === Market.YOUTUBE
              ? 'youtube-market'
              : market === Market.DISCORD
                ? 'discord-market'
                : 'github-market',
          )}
      >
        {createKhaosPubSignFdTxt}
      </button>
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer &&
        khaosPubSign &&
        clubsName &&
        tokenName &&
        tokenSymbol &&
        assetName &&
        personalAccessToken
          ? isCreatingPropertyAddr
            ? 'animate-pulse bg-gray-500/60'
            : ''
          : 'opacity-30'
      }`}
    >
      <p class="font-normal text-base text-white">{i18n('StartClub')}</p>
      <button
        disabled={!signer ||
          !khaosPubSign ||
          isCreatingPropertyAddr ||
          isCreatingKhaosPubSign ||
          !clubsName ||
          !tokenName ||
          !tokenSymbol ||
          !assetName ||
          !personalAccessToken ||
          !market}
        class={`hs-button is-filled px-8 py-4 ${
          isCreatingPropertyAddr ? 'animate-pulse bg-gray-500/60' : ''
        } ${!signer || !khaosPubSign || !clubsName || !tokenName || !tokenSymbol || !assetName || !personalAccessToken || !market ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) =>
          createAndAuthenticate(market, assetName)}
      >
        {createProertyAddrFdTxt}
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
