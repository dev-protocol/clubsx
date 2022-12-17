<script lang="ts">
  import { initializeFirebase } from '../../fixtures/firebase'
  import { sendSignInLinkToEmail } from 'firebase/auth'
  import { GetModalProvider, ReConnectWallet } from '@fixtures/wallet'
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'

  export let config: ClubsConfiguration

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
        console.log('error is: ', error)
        // ...
      })
  }
  const walletConnect = async () => {
    const modalProvider = GetModalProvider()
    const { provider, currentAddress } = await ReConnectWallet(modalProvider)
    if (!currentAddress || !provider) {
      return
    }

    const updatedUptions = Object.assign({}, config.options, {
      key: '__draft',
      value: {
        isInDraft: true,
        address: currentAddress,
      },
    })

    const updatedConfig = Object.assign(config, {
      options: updatedUptions,
    })

    await setConfig(updatedConfig)

    // // TODO
    // // navigate to next page
    // window.location.href = '/setup/homepage'
  }
</script>

<div class="flex flex-col items-center">
  <section class="mb-8 pb-8 mt-8 border-b-2 border-gray-400">
    <div class="flex items-center">
      <div class="mr-2">
        <input
          bind:value={email}
          id="email"
          name="email"
          type="email"
          placeholder="Your email"
          class="rounded bg-gray-700 py-3 px-4 w-64 text-right"
        />
      </div>

      <button
        on:click|preventDefault={(_) => sendMagicLink()}
        class="text-sm bg-blue-500 px-4 rounded-xl py-3 px-6"
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
    <span class="text-sm text-gray-400 mb-4">Already have a wallet?</span>

    <button
      class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl py-3 px-6"
      on:click|preventDefault={(_) => walletConnect()}
    >
      Sign with your wallet
    </button>
  </div>
</div>
