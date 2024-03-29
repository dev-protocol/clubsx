<script lang="ts">
  import type { EthersProviderFrom as TypeEthersProviderFrom } from '@fixtures/wallet'
  import type Web3Modal from 'web3modal'

  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { encode, i18nFactory, setConfig } from '@devprotocol/clubs-core'
  import { BrowserProvider } from 'ethers'
  import { defaultConfig } from '@constants/defaultConfig'
  import { onMount } from 'svelte'
  import EmailConnect from '../EmailConnect/EmailConnect.svelte'
  import type { DraftOptions } from '@constants/draft'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { Strings } from './i18n'

  export let siteName: string

  let walletAwaitingUserConfirmation: boolean = false
  let walletConnectStatusMsg: string = ''
  let disableCreationUsingWallet: boolean = false
  let GetModalProvider: Web3Modal
  let EthersProviderFrom: typeof TypeEthersProviderFrom
  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(async () => {
    const wallet = await import('@fixtures/wallet')
    GetModalProvider = wallet.GetModalProvider()
    EthersProviderFrom = wallet.EthersProviderFrom
    i18n = i18nBase(navigator.languages)
  })

  const walletConnect = async () => {
    let provider: UndefinedOr<BrowserProvider>
    let currentAddress: string | undefined

    try {
      walletAwaitingUserConfirmation = true
      walletConnectStatusMsg =
        'Awaiting wallet connection confirmation on wallet...'
      const connection = await EthersProviderFrom(GetModalProvider)
      walletConnectStatusMsg =
        'Wallet connection confirmed, initiating clubs creation...'

      provider = connection.provider
      currentAddress = connection.currentAddress
    } catch (error: any) {
      walletConnectStatusMsg = 'Wallet connection failed, try again!'
    } finally {
      walletAwaitingUserConfirmation = false
    }

    if (!currentAddress || !provider) {
      return
    }

    const siteNameCheckRes = await fetch(`/api/verifySiteName/${siteName}`)
    if (!siteNameCheckRes.ok) {
      return
    }

    const isReachedCreationLimitsRes = await fetch(
      `/api/hasCreationLimitReached/${currentAddress}`,
    )
    const isReachedCreationLimitsResJson =
      await isReachedCreationLimitsRes.json()
    if (
      !isReachedCreationLimitsRes.ok ||
      isReachedCreationLimitsResJson?.isCreationLimitReached
    ) {
      disableCreationUsingWallet = true
      walletAwaitingUserConfirmation = false
      walletConnectStatusMsg =
        'You have reached limit of clubs creation! You cannot create more clubs'
      return
    } else {
      disableCreationUsingWallet = false
    }

    // Make the default config.
    const config: ClubsConfiguration = {
      ...defaultConfig,
      name: siteName,
      url: `https://${siteName}.clubs.place`,
      options: [
        ...(defaultConfig.options ? defaultConfig.options : []),
        {
          key: '__draft',
          value: {
            isInDraft: true,
            address: currentAddress,
          },
        } as DraftOptions,
      ],
    }

    // Get the signature ready.
    const signer = await provider.getSigner()
    const encodedConfig = encode(config)
    const hash = `Create clubs for ${siteName} @ts:${new Date().getTime()}`

    let sig: string | undefined
    try {
      walletAwaitingUserConfirmation = true
      walletConnectStatusMsg =
        'Awaiting clubs creation confirmation on wallet...'
      sig = await signer.signMessage(hash)
      walletConnectStatusMsg = 'Creating your club...'
    } catch (error: any) {
      walletAwaitingUserConfirmation = false
      walletConnectStatusMsg = 'Clubs creation confirmation failed, try again!'
    }

    if (!sig) {
      return
    }

    const body = {
      site: siteName,
      config: encode(config),
      hash,
      sig,
      expectedAddress: currentAddress,
    }

    // Save the config to db.
    const res = await fetch('/api/addDaoToDraft', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setConfig(config)
      walletAwaitingUserConfirmation = false
      walletConnectStatusMsg = 'Clubs creation confirmed, loading setup...'
      window.location.href = new URL(
        `${siteName}/setup/basic`,
        `${location.protocol}//${location.host}`,
      ).toString()
    } else {
      const jsonResponse = await res.json()
      walletAwaitingUserConfirmation = false
      if (
        res.status === 400 &&
        jsonResponse.message &&
        jsonResponse.message
          .toLowerCase()
          .includes('you already have created 3 clubs')
      ) {
        disableCreationUsingWallet = true
        walletConnectStatusMsg =
          'You have reached limit of clubs creation! You cannot create more clubs'
      } else {
        disableCreationUsingWallet = false
        walletConnectStatusMsg =
          'Clubs creation confirmation failed, try again!'
      }
    }
  }
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">{i18n('Header')}</h1>
    <p>{i18n('SubHeader')}</p>
  </section>

  <section class="grid gap-24">
    <EmailConnect {siteName} />

    <p
      role="separator"
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:border-white/20 before:content-[''] after:block after:border-b after:border-white/20 after:content-['']"
    >
      or
    </p>

    <div class="flex flex-col items-center">
      <span class="mb-4">{i18n('WalletCheck')}</span>

      <button
        class={`hs-button is-filled is-native-blue px-8 py-4 text-inherit ${
          !GetModalProvider ||
          !EthersProviderFrom ||
          walletAwaitingUserConfirmation
            ? 'animate-pulse bg-gray-500/60'
            : ''
        } ${disableCreationUsingWallet ? 'bg-gray-500/60' : ''}`}
        disabled={!GetModalProvider ||
          !EthersProviderFrom ||
          walletAwaitingUserConfirmation ||
          disableCreationUsingWallet}
        on:click|preventDefault={(_) => walletConnect()}
      >
        {walletConnectStatusMsg == ''
          ? 'Sign with your wallet'
          : walletConnectStatusMsg}
      </button>
    </div>
  </section>
</div>

<style lang="scss">
  @use '@devprotocol/hashi/hs-button';

  @include hs-button.extend('filled.native-blue') {
    @include hs-button.color(
      (
        fill: 'native-blue.400',
        ink: 'native-blue.ink',
        border: 'native-blue.400',
      )
    );

    &:hover,
    &:focus {
      @include hs-button.color(
        (
          fill: 'native-blue.300',
          ink: 'native-blue.ink',
          border: 'native-blue.300',
        )
      );
    }

    &:active {
      @include hs-button.color(
        (
          fill: 'native-blue.200',
          ink: 'native-blue.ink',
          border: 'native-blue.200',
        )
      );
    }
  }
</style>
