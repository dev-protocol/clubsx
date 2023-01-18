<script lang="ts">
  import type { EthersProviderFrom as TypeEthersProviderFrom } from '@fixtures/wallet'
  import type Web3Modal from 'web3modal'

  import {
    ClubsConfiguration,
    encode,
    setConfig,
  } from '@devprotocol/clubs-core'
  import { utils } from 'ethers'
  import { defaultConfig } from '@constants/defaultConfig'
  import { onMount } from 'svelte'
  import EmailConnect from '../EmailConnect/EmailConnect.svelte'

  export let siteName: string

  let GetModalProvider: Web3Modal
  let EthersProviderFrom: typeof TypeEthersProviderFrom
  const firebaseCallbackUrl = import.meta.env.PUBLIC_FIREBASE_CALLBACK_URL

  onMount(async () => {
    const wallet = await import('@fixtures/wallet')
    GetModalProvider = wallet.GetModalProvider()
    EthersProviderFrom = wallet.EthersProviderFrom
  })

  const walletConnect = async () => {
    const { provider, currentAddress } = await EthersProviderFrom(
      GetModalProvider
    )
    if (!currentAddress || !provider) {
      return
    }

    const siteNameCheckRes = await fetch(`/api/verifySiteName/${siteName}`)
    if (!siteNameCheckRes.ok) {
      return
    }

    // Make the default config.
    const config: ClubsConfiguration = {
      ...defaultConfig,
      name: siteName,
      options: [
        ...(defaultConfig.options ? defaultConfig.options : []),
        {
          key: '__draft',
          value: {
            isInDraft: true,
            address: currentAddress,
          },
        },
      ],
    }

    // Get the signature ready.
    const signer = provider.getSigner()
    const encodedConfig = encode(config)
    const hash = utils.hashMessage(encodedConfig)
    const sig = await signer.signMessage(hash)
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
      window.location.href = new URL(
        '/setup/basic',
        `${location.protocol}//${siteName}.${location.host}`
      ).toString()
    }
  }
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">Connect Your Account</h1>
    <p>Link your account to your club.</p>
  </section>

  <section class="grid gap-24	">
    <EmailConnect firebaseCallbackUrl={`${firebaseCallbackUrl}/${siteName}`} />

    <p
      role="separator"
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:content-[''] after:block after:border-b after:content-[''] "
    >
      or
    </p>

    <div class="flex flex-col items-center">
      <span class="mb-4">Already have a wallet?</span>

      <button
        class={`hs-button is-filled border-0 bg-native-blue-300 px-8 py-4 text-inherit ${
          !GetModalProvider || !EthersProviderFrom
            ? 'animate-pulse bg-gray-500/60'
            : ''
        }`}
        disabled={!GetModalProvider || !EthersProviderFrom}
        on:click|preventDefault={(_) => walletConnect()}
      >
        Sign with your wallet
      </button>
    </div>
  </section>
</div>
