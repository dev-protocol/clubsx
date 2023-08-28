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
        class={`hs-button is-filled is-native-blue is-large ${
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
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:border-white/20 before:content-[''] after:block after:border-b after:border-white/20 after:content-['']"
    >
      or
    </p>
    <div class="flex flex-col items-center">
      <span class="mb-4">Signin with email</span>
      <EmailConnect />
    </div>
    <p
      role="separator"
      class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 before:block before:border-b before:border-white/20 before:content-[''] after:block after:border-b after:border-white/20 after:content-['']"
    >
      or maybe...
    </p>
    <p class="text-center">
      <a class="hs-button is-outlined text-native-blue-300" href="/domain"
        >Don't have an account?</a
      >
    </p>
  </section>
</div>

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
