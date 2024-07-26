<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { encode, i18nFactory, setConfig } from '@devprotocol/clubs-core'
  import { type Signer } from 'ethers'
  import { defaultConfig } from '@constants/defaultConfig'
  import { onMount } from 'svelte'
  import type { DraftOptions } from '@constants/draft'
  import { Strings } from './i18n'
  import { combineLatest } from 'rxjs'

  export let siteName: string

  let walletAwaitingUserConfirmation: boolean = false
  let walletConnectStatusMsg: string = ''
  let disableCreationUsingWallet: boolean = false
  let signer: Signer | undefined
  let account: string | undefined

  const i18nBase = i18nFactory(Strings)
  let i18n = i18nBase(['en'])

  onMount(async () => {
    i18n = i18nBase(navigator.languages)
    const { connection } = await import('@devprotocol/clubs-core/connection')
    combineLatest([connection().signer, connection().account]).subscribe(
      ([_signer, _account]) => {
        signer = _signer
        account = _account
      },
    )
  })

  const walletConnect = async (
    currentSigner: Signer,
    currentAddress: string,
  ) => {
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
    const hash = `Create clubs for ${siteName} @ts:${new Date().getTime()}`

    let sig: string | undefined
    try {
      walletAwaitingUserConfirmation = true
      walletConnectStatusMsg =
        'Awaiting clubs creation confirmation on wallet...'
      sig = await currentSigner.signMessage(hash)
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
    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer && account ? 'opacity-30' : ''
      }`}
    >
      <h2 class="font-bold text-3xl">Connect</h2>
      <slot />
    </div>
    <div
      class={`p-8 rounded-3xl bg-surface-400 flex flex-col lg:flex-row justify-between items-center gap-5 transition-opacity duration-700 ${
        signer && account ? '' : 'opacity-30'
      }`}
    >
      <h2 class="font-bold text-3xl">Sign</h2>
      <button
        class={`hs-button is-filled px-8 py-4 ${
          walletAwaitingUserConfirmation ? 'animate-pulse bg-gray-500/60' : ''
        } ${disableCreationUsingWallet ? 'bg-gray-500/60' : ''}`}
        disabled={!signer ||
          !account ||
          walletAwaitingUserConfirmation ||
          disableCreationUsingWallet ||
          walletConnectStatusMsg.toLowerCase() ==
            'Clubs creation confirmed, loading setup...'.toLowerCase()}
        on:click|preventDefault={(_) => {
          signer && account ? walletConnect(signer, account) : null
        }}
      >
        {walletConnectStatusMsg == ''
          ? 'Sign with your account'
          : walletConnectStatusMsg}
      </button>
    </div>
  </section>
</div>
