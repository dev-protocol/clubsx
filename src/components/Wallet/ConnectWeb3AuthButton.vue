<script setup lang="ts">
import { whenDefined } from '@devprotocol/util-ts'
import { Web3Auth } from '@web3auth/modal'
import type { Web3AuthOptions } from '@web3auth/modal'
import { onMounted, ref } from 'vue'

const { PUBLIC_WEB3AUTH_CLIENT_ID, PUBLIC_WEB3AUTH_NETWORK } = import.meta.env

const props = defineProps<{
  label?: string
  class?: string
  overrideClass?: string
  chainId?: number
  isDisabled?: boolean
  redirectOnSignin?: boolean
}>()

const truncatedAddress = ref<string>()
const error = ref<Error>()
const loaded = ref<boolean>()
const truncateAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  return !match ? address : `${match[1]}\u2026${match[2]}`
}
const chainConfig = {
  chainNamespace: 'eip155',
  chainId: '0x89',
  rpcTarget: 'https://rpc.ankr.com/polygon',
  displayName: 'Polygon Mainnet',
  blockExplorer: 'https://polygon.etherscan.io',
  ticker: 'MATIC',
  tickerName: 'Polygon',
} satisfies Web3AuthOptions['chainConfig']

const web3auth = new Web3Auth({
  clientId: PUBLIC_WEB3AUTH_CLIENT_ID,
  web3AuthNetwork: PUBLIC_WEB3AUTH_NETWORK,
  chainConfig,
})

await web3auth.initModal()

onMounted(async () => {
  loaded.value = true
  const connectionPromise = import('@devprotocol/clubs-core/connection')
  const { connection } = await connectionPromise

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
        ? new Error(
            `Wrong chain: Please switch it to ${chainConfig.tickerName}`,
          )
        : undefined,
    )
  })
})
</script>

<template>
  <span class="relative block">
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
      :data-is-loading="!loaded"
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
