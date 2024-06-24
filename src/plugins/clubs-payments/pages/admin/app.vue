<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import type { ComposedItem } from '../../'
import type { ContractRunner, Provider, Signer } from 'ethers'
import { authenticate } from '@devprotocol/clubs-core'

const props = defineProps<{
  items: ComposedItem[]
  name: string
  config: string
}>()

const signer = ref<UndefinedOr<Signer>>()
const provider = ref<UndefinedOr<ContractRunner>>()
const signature = ref<string>()
const isOwner = ref(false)
const message = `I'm an owner of ${props.name}. @ts:${new Date().getTime()}`
const connected = computed(() => !!signer.value && !!provider.value)

onMounted(async () => {
  const { connection } = await import('@devprotocol/clubs-core/connection')

  connection().signer.subscribe((connectedSigner) => {
    signer.value = connectedSigner
  })
  connection().provider.subscribe((connectedProvider) => {
    provider.value = connectedProvider
  })
})

const sign = async () => {
  if (!signer.value || !provider.value) return

  const signatureValue = await signer.value.signMessage(message)
  signature.value = signatureValue

  isOwner.value = await authenticate({
    message,
    signature: signatureValue,
    previousConfiguration: props.config,
    provider: provider.value,
  })
}
</script>

<template>
  <section v-if="connected === false"></section>
  <section v-if="isOwner">
    <iframe
      class="airtable-embed"
      src="https://airtable.com/embed/appDDQjhWoL24A1i3/pagwhb3q0UUIJQoPz/form"
      frameborder="0"
      onmousewheel=""
      width="100%"
      height="533"
      style="background: transparent; border: 1px solid #ccc"
    ></iframe>
  </section>
</template>
