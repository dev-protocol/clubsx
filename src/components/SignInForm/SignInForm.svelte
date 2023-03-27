<script lang="ts">
  import type { EthersProviderFrom as TypeEthersProviderFrom } from '@fixtures/wallet'
  import type Web3Modal from 'web3modal'

  import { onMount } from 'svelte'
  import EmailConnect from '../EmailConnect/EmailConnect.svelte'

  let GetModalProvider: Web3Modal
  let EthersProviderFrom: typeof TypeEthersProviderFrom

  onMount(async () => {
    const wallet = await import('@fixtures/wallet')
    GetModalProvider = wallet.GetModalProvider()
    EthersProviderFrom = wallet.EthersProviderFrom
  })

  const walletConnect = async () => {
    const { currentAddress } = await EthersProviderFrom(GetModalProvider)
    if (!currentAddress) {
      return
    }

    window.location.href = new URL(
      `/user/${currentAddress}`,
      window.location.origin
    ).toString()
  }
</script>

<div class="relative grid justify-center p-4 md:p-0">
  <section class="my-16 grid gap-8 text-center md:my-32">
    <h1 class="text-2xl font-bold md:text-5xl">Sign in to Clubs</h1>
  </section>

  <section class="grid gap-12">
    <div class="flex flex-col items-center">
      <span class="mb-4">Signin with your wallet</span>

      <button
        class={`hs-button is-filled bg-native-blue-300 px-8 py-4 text-inherit ${
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

    <div class="flex flex-col items-center">
      <span class="mb-4">Signin with email</span>
      <EmailConnect />
    </div>
    <p
      role="separator"
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:border-white/20 before:content-[''] after:block after:border-b after:border-white/20 after:content-['']"
    >
      or
    </p>
    <p class="text-center">
      <a class="hs-button is-outlined text-native-blue-300" href="/domain"
        >Don't have an account?</a
      >
    </p>
  </section>
</div>
