<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { mainnet, polygon, polygonMumbai } from '@wagmi/core/chains'
import { watchWalletClient } from '@wagmi/core'
import { whenDefined } from '@devprotocol/util-ts'
import { BrowserProvider } from 'ethers'

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
const error = ref<Error>()
const truncateAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  return !match ? address : `${match[1]}\u2026${match[2]}`
}
const modal = ref<ReturnType<typeof createWeb3Modal>>()
const chains = [polygon, polygonMumbai, mainnet]
const defaultChain =
  props.chainId === 137
    ? polygon
    : props.chainId === 80001
    ? polygonMumbai
    : props.chainId === 1
    ? mainnet
    : polygon

const wagmiConfig = defaultWagmiConfig({
  chains: [polygon, polygonMumbai, mainnet],
  projectId,
  appName: 'Web3Modal',
})

const init = () => {
  const w3m = createWeb3Modal({ wagmiConfig, projectId, chains })
  modal.value = w3m
}

init()

onMounted(async () => {
  document.addEventListener('astro:after-swap', init)

  const { connection } = await import('@devprotocol/clubs-core/connection')
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
      :disabled="props.isDisabled"
      @click="modal?.open()"
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
