<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { type UndefinedOr } from '@devprotocol/util-ts'
import type { ContractRunner, Signer } from 'ethers'
import { authenticate } from '@devprotocol/clubs-core'

const props = defineProps<{
  name: string
  config: string
  airtableForm: string
  title: string
}>()

let signer: UndefinedOr<Signer>
let provider: UndefinedOr<ContractRunner>

const isOwner = ref<UndefinedOr<boolean>>()
const loading = ref(false)
const message = ref(
  `I'm an owner of ${props.name}. @ts:${new Date().getTime()}`,
)
const signature = ref<string>()
const connected = ref(false)
const formUrl = computed(
  () =>
    `${props.airtableForm}?prefill_clubs_name=${props.name}&prefill_cert_message=${message.value}&prefill_cert_signature=${signature.value}`,
)

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')

  connection().signer.subscribe((connectedSigner) => {
    signer = connectedSigner
    connected.value = Boolean(connectedSigner)
  })
  connection().provider.subscribe((connectedProvider) => {
    provider = connectedProvider
  })
})

const sign = async () => {
  if (!signer || !provider) return
  loading.value = true

  const signatureValue = await signer.signMessage(message.value)
  signature.value = signatureValue

  isOwner.value = await authenticate({
    message: message.value,
    signature: signatureValue,
    previousConfiguration: props.config,
    provider,
  })
  loading.value = false
}
</script>

<template>
  <div class="grid gap-8">
    <h2 class="font-bold text-3xl">{{ props.title }}</h2>
    <section
      v-if="connected === false"
      class="p-8 rounded-3xl bg-surface-300"
      :class="loading ? 'animate-pulse' : ''"
    >
      <p class="font-bold">You need to Sign-in first.</p>
    </section>
    <section
      v-if="connected && !isOwner"
      class="p-8 rounded-3xl bg-surface-300 flex flex-col lg:flex-row justify-between items-center gap-5"
      :class="loading ? 'animate-pulse' : ''"
    >
      <p class="font-bold">Verify your ownership</p>
      <button class="hs-button is-filled is-large" @click="sign">Verify</button>
    </section>

    <section
      v-if="isOwner === false"
      class="p-4 rounded-3xl bg-error-300 text-error-ink"
    >
      <p class="font-bold">You don't seem to have ownership yet.</p>
    </section>

    <div
      v-if="!isOwner"
      class="rounded-3xl bg-surface-400 animate-pulse aspect-square"
    ></div>

    <section v-if="connected && isOwner">
      <iframe
        class="rounded-xl w-full min-h-[700px]"
        :src="formUrl"
        frameborder="0"
        onmousewheel=""
      ></iframe>
    </section>
  </div>
</template>
