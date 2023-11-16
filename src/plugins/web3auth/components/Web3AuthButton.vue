<script setup lang="ts">
import { whenDefined, type UndefinedOr, isNotError } from '@devprotocol/util-ts'
import type { Web3Auth as IWeb3Auth, Web3AuthOptions } from '@web3auth/modal'
import { Web3Auth } from '@web3auth/modal'
import type { IProvider, UserInfo } from '@web3auth/base'
import { mainnet, polygon, polygonMumbai } from '@wagmi/core/chains'
import { computed, onMounted, ref, watch } from 'vue'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { BrowserProvider } from 'ethers'
import Modal from './Modal.vue'
import type { Web3AuthButtonOptions, Web3AuthButtonEnvs } from '../types'
import ClubsLogo from '../assets/clubs--color.svg'

const props = defineProps<Web3AuthButtonOptions & Web3AuthButtonEnvs>()

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
  rpcTarget:
    props.rpcUrl ??
    `${defaultChain.rpcUrls.infura.http}/${props.web3authInfuraKey}`,
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
  const info = await web3auth?.getUserInfo()
  console.log({ info })
  userInfo.value = info
}

const logout = async () => {
  await web3auth?.logout()
  provider.value = null
  showModal.value = false
}

onMounted(async () => {
  web3auth = new Web3Auth({
    clientId: props.web3authClientId,
    web3AuthNetwork: props.web3authNetwork,
    chainConfig,
    uiConfig: {
      appName: 'Clubs',
      logoDark: ClubsLogo.src,
      logoLight: ClubsLogo.src,
    },
  })
  await web3auth.initModal()
  loaded.value = true

  const [{ connection: conn }] = await Promise.all([
    import('@devprotocol/clubs-core/connection'),
  ])
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
  const res = !connection
    ? new Error('clubs-core/connection not initialized yet')
    : prov
      ? await connection()
          .setEip1193Provider(prov, BrowserProvider)
          .then(() => true)
      : connection().signer.next(undefined)
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

  <Teleport to="body" :disabled="!loaded">
    <Modal :show="showModal" @close="showModal = false">
      <template #body>
        <div class="flex flex-col gap-5">
          <dl class="grid grid-cols-[auto,1fr] gap-2 gap-x-4">
            <dt class="font-bold text-white">Address:</dt>
            <dd class="break-all text-white/70">{{ account }}</dd>
            <dt class="font-bold text-white">Verifier:</dt>
            <dd class="text-white/70">{{ userInfo?.typeOfLogin }}</dd>
            <dt class="font-bold text-white">ID:</dt>
            <dd class="text-white/70">{{ userInfo?.verifierId }}</dd>
          </dl>

          <button class="hs-button is-filled is-fullwidth" @click="logout">
            Disconnect
          </button>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>
