<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { mainnet, polygon, polygonMumbai } from '@wagmi/core/chains'
import type { useWeb3Modal } from '@web3modal/wagmi/vue'
import { whenDefined } from '@devprotocol/util-ts'
import { BrowserProvider } from 'ethers'
import { cleanImport } from '@fixtures/utility'

const props = defineProps<{
  projectId?: string
  label?: string
  class?: string
  overrideClass?: string
  chainId?: number
  isDisabled?: boolean
  redirectOnSignin?: boolean
}>()

const projectId =
  props.projectId ?? import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID

const truncatedAddress = ref<string>()
const modal = ref<ReturnType<typeof useWeb3Modal>>()
const error = ref<Error>()
const truncateAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  return !match ? address : `${match[1]}\u2026${match[2]}`
}

const chains = [polygon, polygonMumbai, mainnet]
const defaultChain =
  props.chainId === 137
    ? polygon
    : props.chainId === 80001
    ? polygonMumbai
    : props.chainId === 1
    ? mainnet
    : polygon

const initWeb3Modal = async () => {
  console.log('***', 1)
  const [
    { createWeb3Modal, defaultWagmiConfig, useWeb3Modal },
    { watchWalletClient },
    { connection },
  ] = await Promise.all([
    cleanImport<typeof import('@web3modal/wagmi/vue')>('@web3modal/wagmi/vue'),
    import('@wagmi/core'),
    import('@devprotocol/clubs-core/connection'),
  ])
  console.log('***', 2, createWeb3Modal)
  const wagmiConfig = defaultWagmiConfig({
    chains: [polygon, polygonMumbai, mainnet],
    projectId,
    appName: 'Web3Modal',
  })

  createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain })

  watchWalletClient({}, (wallet) => {
    console.log({ wallet })
    whenDefined(wallet, (wal) =>
      connection().setEip1193Provider(wal.transport, BrowserProvider),
    ) ?? connection().signer.next(undefined)
  })
  connection().account.subscribe((account) => {
    if (account && props.redirectOnSignin) {
      window.location.href = new URL(
        `/user/${account}`,
        window.location.origin,
      ).toString()
    }
    truncatedAddress.value = whenDefined(account, (a) => truncateAddress(a))
  })
  connection().chain.subscribe((chain) => {
    error.value = whenDefined(chain, (chainId) =>
      props.chainId && chainId !== props.chainId // There might be a case where we don't have chainId in props (eg. signin, publish flow, etc)
        ? new Error(`Wrong chain: Please switch it to ${defaultChain.name}`)
        : undefined,
    )
  })

  modal.value = useWeb3Modal()
}

onMounted(async () => {
  initWeb3Modal()
  document.addEventListener('astro:after-swap', initWeb3Modal)
})
</script>

<template>
  <span class="relative">
    <div
      v-if="error"
      class="absolute top-[100%] -mt-1 w-full rounded-b-lg bg-dp-red-400 p-2 pt-3 text-center text-sm text-white opacity-50"
    >
      {{ error.message }}
    </div>
    <button
      :class="`${
        props.overrideClass
          ? props.overrideClass
          : 'hs-button is-filled is-large is-fullwidth relative data-[is-loading=true]:animate-pulse'
      } ${error ? 'is-error' : ''}`"
      v-bind:class="props.class"
      :data-is-loading="!modal"
      :disabled="props.isDisabled"
      @click="modal?.value.open()"
    >
      {{
        truncatedAddress
          ? truncatedAddress
          : props.label
          ? props.label
          : 'Connect'
      }}
    </button>
  </span>
</template>
