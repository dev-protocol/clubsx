<script lang="ts">
  import { initializeFirebase } from '../../fixtures/firebase'
  import { sendSignInLinkToEmail } from 'firebase/auth'
  import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
  import {
    ClubsConfiguration,
    encode,
    setConfig,
  } from '@devprotocol/clubs-core'
  import { utils } from 'ethers'
  import { defaultConfig } from '@constants/defaultConfig'

  export let siteName: string

  let email = ''
  let emailErrorMessage = ''
  let emailSent = false

  const sendMagicLink = async () => {
    if (emailSent) {
      return
    }

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      // url: 'https://www.example.com/finishSignUp?cartId=1234',
      url: import.meta.env.PUBLIC_FIREBASE_CALLBACK_URL,
      // This must be true.
      handleCodeInApp: true,
    }

    const auth = initializeFirebase()

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
  }

  const walletConnect = async () => {
    const modalProvider = GetModalProvider()
    const { provider, currentAddress } = await ReConnectWallet(modalProvider)
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
      config,
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

<div class="flex flex-col items-center">
  <section class="mb-8 mt-8 border-b-2 border-gray-400 pb-8">
    <div class="flex items-center">
      <div class="mr-2">
        <input
          bind:value={email}
          id="email"
          name="email"
          type="email"
          placeholder="Your email"
          class="w-64 rounded bg-gray-700 py-3 px-4 text-right"
        />
      </div>

      <button
        on:click|preventDefault={(_) => sendMagicLink()}
        class="rounded-xl bg-blue-500 px-4 py-3 px-6 text-sm"
      >
        {#if emailSent}
          Check your inbox
        {:else}
          Send Magic Link
        {/if}
      </button>

      {#if emailErrorMessage.length > 0}
        <span class="text-sm">{emailErrorMessage}</span>
      {/if}
    </div>
  </section>

  <div class="flex flex-col items-center">
    <span class="mb-4 text-sm text-gray-400">Already have a wallet?</span>

    <button
      class="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 px-6"
      on:click|preventDefault={(_) => walletConnect()}
    >
      Sign with your wallet
    </button>
  </div>
</div>
