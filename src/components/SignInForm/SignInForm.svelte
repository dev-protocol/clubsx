<script lang="ts">
  import type { EthersProviderFrom as TypeEthersProviderFrom } from '@fixtures/wallet'
  import type Web3Modal from 'web3modal'

  import { onMount } from 'svelte'
  import EmailConnect from '../EmailConnect/EmailConnect.svelte'

  const firebaseCallbackUrl = import.meta.env
    .PUBLIC_FIREBASE_CALLBACK_SIGNIN_URL

  let GetModalProvider: Web3Modal
  let EthersProviderFrom: typeof TypeEthersProviderFrom

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

    // TODO: authenticate and navigate
  }
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">Sign in to Clubs</h1>
  </section>

  <section class="grid gap-24	">
    <div class="flex flex-col items-center">
      <span class="mb-4">Use your wallet</span>

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

    <p
      role="separator"
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:content-[''] after:block after:border-b after:content-[''] "
    >
      or
    </p>

    <div class="flex flex-col items-center">
      <span class="mb-4">Use email</span>
      <EmailConnect {firebaseCallbackUrl} />
    </div>
  </section>
</div>
