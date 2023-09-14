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

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain })

const modal = useWeb3Modal()

onMounted(() => {
  const template: HTMLTemplateElement =
    document.querySelector('template#w3m') ??
    (() => {
      const el = document.createElement('template')
      el.id = 'w3m'
      document.body.after(el)
      return el
    })()
  const observer = new MutationObserver((mutationList, observer) => {
    const w3mModal = mutationList.map((mutation) => {
      const nodes = [...mutation.addedNodes]
      const res = nodes.find((node) => node.nodeName === 'W3M-MODAL')
      return res
    })
    w3mModal.forEach((node) => {
      whenDefined(node, (el) => {
        const clone = document.importNode(el, true)
        template.appendChild(clone)
        observer.disconnect()
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })

  const reinit = () => {
    const clone = document.importNode(template.content, true)
    document.body.appendChild(clone)
  }

  document.addEventListener('astro:after-swap', reinit)
})

onMounted(async () => {
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
      @click="modal.open()"
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
