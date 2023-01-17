<script lang="ts">
  import { initializeFirebase } from '@fixtures/firebase'
  import { sendSignInLinkToEmail } from 'firebase/auth'

  export let firebaseCallbackUrl: string

  let email = ''
  let emailErrorMessage = ''
  let emailSent = false
  let emailSending = false

  const sendMagicLink = async () => {
    if (emailSent) {
      return
    }

    emailSending = true

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      // url: 'https://www.example.com/finishSignUp?cartId=1234',
      // url: `${import.meta.env.PUBLIC_FIREBASE_CALLBACK_URL}/${siteName}`,
      url: firebaseCallbackUrl,
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
</script>

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
    <label class="hs-form-field is-filled mb-0">
      <input
        bind:value={email}
        id="email"
        name="email"
        type="email"
        placeholder="Your email"
        class="hs-form-field__input"
      />
    </label>
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
