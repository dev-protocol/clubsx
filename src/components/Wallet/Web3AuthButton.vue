<script setup lang="ts">
import { whenDefined, type UndefinedOr, isNotError } from '@devprotocol/util-ts'
import { Web3Auth } from '@web3auth/modal'
import type { Web3Auth as IWeb3Auth, Web3AuthOptions } from '@web3auth/modal'
import type { IProvider, UserInfo } from '@web3auth/base'
import { mainnet, polygon, polygonMumbai } from '@wagmi/core/chains'
import { computed, onMounted, ref, watch } from 'vue'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { BrowserProvider } from 'ethers'
import Modal from '@components/Modal/Modal.vue'

const {
  PUBLIC_WEB3AUTH_CLIENT_ID,
  PUBLIC_WEB3AUTH_NETWORK,
  PUBLIC_INFURA_KEY,
} = import.meta.env

const props = defineProps<{
  label?: string
  class?: string
  overrideClass?: string
  chainId?: number
  isDisabled?: boolean
  redirectOnSignin?: boolean
}>()

const account = ref<string>()
const error = ref<Error>()
const loaded = ref<boolean>()
const provider = ref<IProvider | null | undefined>()
const showModal = ref(false)
const userInfo = ref<Partial<UserInfo>>()
let web3auth: UndefinedOr<IWeb3Auth>
let connection: UndefinedOr<typeof Connection>

const truncatedAddress = computed(() => {
  const match = account.value?.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/,
  )
  return !match ? account.value : `${match[1]}\u2026${match[2]}`
})
const defaultChain =
  props.chainId === 137
    ? polygon
    : props.chainId === 80001
      ? polygonMumbai
      : props.chainId === 1
        ? mainnet
        : polygon

const chainConfig = {
  chainNamespace: 'eip155',
  chainId: `0x${defaultChain.id.toString(16)}`,
  rpcTarget: `${defaultChain.rpcUrls.infura.http}/${PUBLIC_INFURA_KEY}`,
  displayName: defaultChain.name,
  blockExplorer: defaultChain.blockExplorers.default.url,
  ticker: defaultChain.nativeCurrency.name,
  tickerName: defaultChain.name,
} satisfies Web3AuthOptions['chainConfig']

const login = async () => {
  provider.value = await web3auth?.connect()
}

const modal = async () => {
  showModal.value = true
  userInfo.value = await web3auth?.getUserInfo()
}

const logout = async () => {
  await web3auth?.logout()
  provider.value = null
}

onMounted(async () => {
  web3auth = new Web3Auth({
    clientId: PUBLIC_WEB3AUTH_CLIENT_ID,
    web3AuthNetwork: PUBLIC_WEB3AUTH_NETWORK,
    chainConfig,
  })
  await web3auth.initModal()
  loaded.value = true

  const connectionPromise = import('@devprotocol/clubs-core/connection')
  const { connection: conn } = await connectionPromise
  connection = conn

  connection().account.subscribe((_account) => {
    account.value = _account
    if (_account && props.redirectOnSignin) {
      window.location.href = new URL(
        `/user/${_account}`,
        window.location.origin,
      ).toString()
    }
  })
  connection().chain.subscribe((chain) => {
    error.value = whenDefined(chain, (chainId) =>
      props.chainId && chainId !== props.chainId // There might be a case where we don't have chainId in props (eg. signin, publish flow, etc)
        ? new Error(`Wrong chain: Please switch it to ${defaultChain.name}`)
        : undefined,
    )
  })
})

watch(provider, async (prov) => {
  console.log(prov)

  const res =
    (prov
      ? await whenDefined(connection, (conn) =>
          conn()
            .setEip1193Provider(prov, BrowserProvider)
            .then(() => true),
        )
      : whenDefined(connection, (conn) => conn().signer.next(undefined))) ??
    new Error('clubs-core/connection not initialized yet')

  error.value = isNotError(res) ? undefined : res
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
      @click="provider ? modal() : login()"
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

  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <modal :show="showModal" @close="showModal = false">
      <template #body>
        <div class="flex flex-col gap-5">
          <p>
            Address: <span>{{ account }}</span>
          </p>
          <p>
            Verifier: <span>{{ userInfo?.verifier }}</span>
          </p>
          <button
            class="hs-button is-filled is-large is-fullwidth"
            @click="logout"
          >
            Disconnect
          </button>
        </div>
      </template>
    </modal>
  </Teleport>
</template>
