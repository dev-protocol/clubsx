<script lang="ts">
  import { onMount } from 'svelte'
  import { sign } from '@devprotocol/khaos-kit'
  import type { NetworkName } from '@devprotocol/khaos-core'
  import { addresses, marketAddresses } from '@devprotocol/dev-kit'
  import { type Signer, type ContractRunner, ZeroAddress } from 'ethers'
  import { i18nFactory, type ClubsConfiguration } from '@devprotocol/clubs-core'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import {
    createMarketBehaviorContract,
    createMarketContract,
    createPropertyFactoryContract,
  } from '@devprotocol/dev-kit/l2'

  import { Strings } from './i18n'
  import { selectMarketAddressOption } from './utils'
  import { Market, type CreatorPlatform } from './types'

  export let clubsName: string
  export let tokenName: string
  export let tokenSymbol: string

  const I18_BASE = i18nFactory(Strings)
  const NETWORK_NAME: string = 'polygon-mainnet'

  let i18n = I18_BASE(['en'])
  let signer: Signer | undefined
  let connection: typeof Connection
  let provider: ContractRunner | undefined
  let khaosPubSign: string | undefined
  let isCreatingKhaosPubSign: boolean = false
  let createKhaosPubSignFdTxt: string = ''
  let propertyAddress: string | undefined
  let isCreatingPropertyAddr: boolean = false
  let createProertyAddrFdTxt: string = ''

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
  })

  const setKhaosPubSignStates = async (
    sign: string | undefined,
    toggle: boolean,
    feedback: string,
  ) => {
    khaosPubSign = sign
    isCreatingKhaosPubSign = toggle
    createKhaosPubSignFdTxt = feedback
  }

  const createKhaosPubSign = async (
    personalAccessToken: string,
    assetName: string,
    signId: string = 'github-market',
  ) => {
    try {
      isCreatingKhaosPubSign = true
      if (!provider || !signer) {
        setKhaosPubSignStates(undefined, false, 'Connect your wallet')
        return
      }

      const signMessage = await signer.signMessage(assetName)
      const signerFn = sign(signId, NETWORK_NAME as NetworkName)
      const _khaosPubSign = await signerFn({
        signature: signMessage,
        secret: personalAccessToken,
        message: assetName,
      })

      setKhaosPubSignStates(
        _khaosPubSign
          ? (_khaosPubSign?.publicSignature ?? undefined)
          : undefined,
        false,
        _khaosPubSign ? '' : 'Could not create signature',
      )
      return
    } catch (err) {
      console.log('Err', err)
      setKhaosPubSignStates(
        undefined,
        false,
        `Failed to sign ${signId} market asset`,
      )
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
  }

  const createAndAuthenticate = async (
    selectedMarket: Market,
    assetName: string,
  ) => {
    try {
      isCreatingPropertyAddr = true
      if (!provider || !signer) {
        setKhaosPubSignStates(undefined, false, 'Connect your wallet')
        setCreateAndAuthenticateStates(undefined, false, 'Connect your wallet')
        return
      }
      if (!khaosPubSign) {
        setKhaosPubSignStates(undefined, false, 'Sign')
        setCreateAndAuthenticateStates(undefined, false, 'Sign not found!')
        return
      }

      const userAddr: string = await signer.getAddress()
      const propertyFactoryContract = createPropertyFactoryContract(provider)(
        addresses.polygon.mainnet.propertyFactory,
      )
      if (!propertyFactoryContract) {
        setCreateAndAuthenticateStates(
          undefined,
          false,
          'Error fetching contract',
        )
        return
      }

      const marketAddr = selectMarketAddressOption(
        selectedMarket,
        marketAddresses.polygon.mainnet,
      )
      if (!marketAddr) {
        setCreateAndAuthenticateStates(undefined, false, 'Error setting market')
        return
      }

      const marketContract = createMarketContract(provider)(marketAddr)
      const marketBehavior = createMarketBehaviorContract(provider)(
        await marketContract.behavior(),
      )
      const metricsAddress = await marketBehavior.getMetrics(assetName) // for example github repo name or youtube channel id
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

        await created.waitForAuthentication()
        setCreateAndAuthenticateStates(
          created.property,
          false,
          'Tokenized successfully',
        )
        return
      } else {
        setCreateAndAuthenticateStates(
          undefined,
          false,
          `Metrics address ${metricsAddress} already exists for id ${assetName}`,
        )
        return
      }
    } catch (err) {
      console.log('Err', err)
      setCreateAndAuthenticateStates(
        undefined,
        false,
        `Failed to create and authenticate asset`,
      )
    }
  }
</script>

<div
  class="relative flex gap-16 flex-col justify-center p-4 md:p-0 w-[36%] max-w-[36%] ml-auto mr-auto"
>
  <!-- Hero Header -->
  <section class="mt-16 grid gap-8 md:mt-32 min-w-full w-full max-w-full">
    <h1 class="text-2xl font-bold md:text-5xl text-center">{i18n('Header')}</h1>
    <!-- When want to add this to future we need to add translation and uncomment code of this line. -->
    <!-- <p>{i18n('SubHeader')}</p> -->
  </section>

  <!-- Core inputs -->
  <section class="grid gap-16 w-full max-w-full mb-16 md:mb-32">
    <!-- Clubs name -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('ClubNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">{clubsName}</p>
    </div>

    <!-- Token name -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenNameLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">{tokenName}</p>
    </div>

    <!-- Token symbol -->
    <div class="hs-form-field is-filled !gap-4">
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenSymbolLabel')}</span
      >
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">
        {tokenSymbol}
      </p>
    </div>

    <!-- Token supply -->
    <div class="hs-form-field is-filled !gap-4">
      <p class="font-body font-bold text-[32px] !text-[#C4C4C4]">
        10,000,000 {tokenSymbol}
      </p>
      <span class="hs-form-field__label !text-[#C4C4C4]"
        >{i18n('TokenSupply')}</span
      >
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer && !khaosPubSign && clubsName && tokenName && tokenSymbol
          ? ''
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
          !tokenSymbol}
        class={`hs-button is-filled px-8 py-4 ${
          isCreatingKhaosPubSign ? 'animate-pulse bg-gray-500/60' : ''
        } ${!signer || !!khaosPubSign || !clubsName || !tokenName || !tokenSymbol ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) => createKhaosPubSign('', tokenName)}
      >
        {i18n('Sign')}
      </button>
    </div>

    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer && khaosPubSign && clubsName && tokenName && tokenSymbol
          ? ''
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
          !tokenSymbol}
        class={`hs-button is-filled px-8 py-4 ${
          isCreatingPropertyAddr ? 'animate-pulse bg-gray-500/60' : ''
        } ${!signer || !khaosPubSign || !clubsName || !tokenName || !tokenSymbol ? 'bg-gray-500/60' : ''}`}
        on:click|preventDefault={(_) =>
          createAndAuthenticate(Market.GITHUB, '')}
      >
        {i18n('Tokenize')}
      </button>
    </div>
  </section>
</div>
