<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { mainnet, polygon, polygonMumbai } from '@wagmi/core/chains'
import { useWeb3Modal } from '@web3modal/wagmi/vue'
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
}>()

const projectId =
  props.projectId ?? import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID
const truncatedAddress = ref<string>()
const truncateAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  return !match ? address : `${match[1]}\u2026${match[2]}`
}

const chains = [
  props.chainId === 137
    ? polygon
    : props.chainId === 80001
    ? polygonMumbai
    : props.chainId === 1
    ? mainnet
    : polygon,
]
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: 'Web3Modal',
})

createWeb3Modal({ wagmiConfig, projectId, chains })

const modal = useWeb3Modal()

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')
  watchWalletClient({ chainId: chains[0].id }, (wallet) => {
    console.log({ wallet })
    whenDefined(wallet, (wal) =>
      connection().setEip1193Provider(wal.transport, BrowserProvider),
    )
  })
  connection().account.subscribe((account) => {
    truncatedAddress.value = whenDefined(account, (a) => truncateAddress(a))
  })
})
</script>

<template>
  <button
    :class="
      props.overrideClass
        ? props.overrideClass
        : 'hs-button is-filled is-large is-fullwidth data-[is-loading=true]:animate-pulse'
    "
    v-bind:class="props.class"
    :disabled="props.isDisabled"
    @click="modal.open()"
  >
    <span className="hs-button__label">
      {{
        truncatedAddress
          ? truncatedAddress
          : props.label
          ? props.label
          : 'Connect'
      }}
    </span>
  </button>
</template>
