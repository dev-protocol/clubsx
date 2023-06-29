<script lang="ts">
  import type { UndefinedOr } from '@devprotocol/util-ts'

  export let siteName: UndefinedOr<string> = undefined

  let email = ''
  let emailErrorMessage = ''
  let emailSent = false
  let emailSending = false
  const emailEndpoint = import.meta.env.PUBLIC_EMAIL_AUTH_ENDPOINT

  const sendMagicLink = async () => {
    if (emailSent) {
      return
    }

    emailSending = true

    await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: siteName
        ? JSON.stringify({ email, subDomain: siteName })
        : JSON.stringify({ email }),
    })
      .then(() => {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', email)
        emailSent = true
      })
      .catch((err) => {
        console.error(`error sending login email: ${JSON.stringify(err)}`)
        emailErrorMessage = err?.message ?? 'Error sending login email'
      })
      .finally(() => {
        emailSending = false
      })
  }
</script>

{#if emailSending}
  <span
    class="hs-button is-filled animate-pulse rounded bg-gray-500/60 px-8 py-4 text-inherit"
    >Sending a magic link</span
  >
{:else if emailSent}
  <span
    class="hs-button is-filled bg-success-300 cursor-default px-8 py-4 text-inherit"
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
      class="hs-button is-filled is-native-blue px-8 py-4 text-inherit"
    >
      Continue
    </button>
    {#if emailErrorMessage.length > 0}
      <span class="bg-danger-300 col-span-2 rounded-md px-8 py-4 text-sm"
        >{emailErrorMessage}</span
      >
    {/if}
  </div>
{/if}

<style lang="scss">
  @use '@devprotocol/hashi/hs-button';

  @include hs-button.extend('filled.native-blue') {
    @include hs-button.color(
      (
        fill: 'native-blue.400',
        ink: 'native-blue.ink',
        border: 'native-blue.400'
      )
    );

    &:hover,
    &:focus {
      @include hs-button.color(
        (
          fill: 'native-blue.300',
          ink: 'native-blue.ink',
          border: 'native-blue.300'
        )
      );
    }

    &:active {
      @include hs-button.color(
        (
          fill: 'native-blue.200',
          ink: 'native-blue.ink',
          border: 'native-blue.200'
        )
      );
    }
  }
</style>
