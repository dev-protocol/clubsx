<script lang="ts">
  import { initializeFirebase } from '../../fixtures/firebase'
  import { sendSignInLinkToEmail } from 'firebase/auth'
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

  export let siteName: string

  let email = ''
  let emailErrorMessage = ''
  let emailSent = false
  let emailSending = false
  let GetModalProvider: Web3Modal
  let EthersProviderFrom: typeof TypeEthersProviderFrom

  onMount(async () => {
    const wallet = await import('@fixtures/wallet')
    GetModalProvider = wallet.GetModalProvider()
    EthersProviderFrom = wallet.EthersProviderFrom
  })

  const sendMagicLink = async () => {
    if (emailSent) {
      return
    }

    emailSending = true

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      // url: 'https://www.example.com/finishSignUp?cartId=1234',
      url: `${import.meta.env.PUBLIC_FIREBASE_CALLBACK_URL}/${siteName}`,
      // This must be true.
      handleCodeInApp: true,
    }

    const auth = initializeFirebase()

    console.log({ auth, email, actionCodeSettings })

    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', email)
        emailSent = true
        // ...
      })
      .catch((error) => {
        emailErrorMessage = error.message
        // ...
      })
      .finally(() => {
        emailSending = false
      })
  }

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
      // TODO: navigate to the next page.
      // window.location.href = '/setup/homepage'
    }
  }
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">Connect Your Account</h1>
    <p>Link your account to your club.</p>
  </section>

  <section class="grid gap-24	">
    {#if emailSending}
      <span
        class="hs-button is-filled animate-pulse rounded border-0 bg-gray-500/60 px-8 py-4 text-inherit"
        >Sending a magic link</span
      >
    {:else if emailSent}
      <span
        class="hs-button is-filled cursor-default border-0 bg-success-300 px-8 py-4 text-inherit"
        >Check your inbox</span
      >
    {:else}
      <div class="grid auto-rows-auto grid-cols-[1fr_auto] items-center gap-2">
        <input
          bind:value={email}
          id="email"
          name="email"
          type="email"
          placeholder="Your email"
          class="rounded-md border-[3px] bg-dp-blue-grey-600 px-8 py-4 font-bold"
        />
        <button
          on:click|preventDefault={(_) => sendMagicLink()}
          class="hs-button is-filled border-0 bg-native-blue-300 px-8 py-4 text-inherit"
        >
          Continue
        </button>
        {#if emailErrorMessage.length > 0}
          <span class="col-span-2 rounded-md bg-danger-300 px-8 py-4 text-sm"
            >{emailErrorMessage}</span
          >
        {/if}
      </div>
    {/if}

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
