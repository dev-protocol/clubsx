<script lang="ts" setup>
import { hashMessage } from 'ethers'
import { computed, onMounted, ref } from 'vue'
import type { PluginMeta } from '@constants/plugins'
import type { connection as Connection } from '@devprotocol/clubs-core/connection'
import { onMountClient } from '@devprotocol/clubs-core/events'
import { EthersProviderFrom, GetModalProvider } from '@fixtures/wallet'
import type { UndefinedOr } from '@devprotocol/util-ts'

const props = defineProps<{
  plugin: PluginMeta
  site: string
}>()

const connection = ref<UndefinedOr<typeof Connection>>()
const connected = ref(false)
const addingPluginToClubsStatusMsg = ref('')
const isAddingPluginToClubs = ref(false)

const isAdded = computed<boolean>(() => {
  return props.plugin.added
})
const isLimitedPreview = computed<boolean>(() => {
  return Boolean(props.plugin.require?.invitation)
})

async function addPluginToClub() {
  isAddingPluginToClubs.value = true
  addingPluginToClubsStatusMsg.value = 'Adding plugin...'

  // Fetch and connect provider, wallet and signer.
  const modalProvider = GetModalProvider()
  const { provider, currentAddress } = await EthersProviderFrom(modalProvider)
  if (!currentAddress || !provider) {
    isAddingPluginToClubs.value = false
    addingPluginToClubsStatusMsg.value = 'Adding failed, try again!'
    return
  }
  const signer = await provider.getSigner()
  connection.value && connection.value().signer.next(signer)

  // Sign the data.
  const hash = hashMessage(props.plugin.id)
  let sig: string
  try {
    sig = await signer.signMessage(hash)
  } catch (error) {
    isAddingPluginToClubs.value = false
    addingPluginToClubsStatusMsg.value = 'Adding failed, try again!'
    return
  }
  if (!sig) {
    isAddingPluginToClubs.value = false
    addingPluginToClubsStatusMsg.value = 'Adding failed, try again!'
    return
  }

  const body: {
    site: string
    pluginId: string
    hash: string
    sig: string
  } = {
    site: props.site,
    pluginId: props.plugin.id,
    hash,
    sig,
  }

  const res = await fetch('/api/plugins/addPluginToClub', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (res.ok) {
    isAddingPluginToClubs.value = false
    addingPluginToClubsStatusMsg.value = 'Add successful, refreshing plugin...'
    window.location.reload()
  } else {
    isAddingPluginToClubs.value = false
    addingPluginToClubsStatusMsg.value = 'Adding failed, try again!'
  }
}

onMounted(() => {
  onMountClient(async () => {
    const [{ connection: _connection }] = await Promise.all([
      import('@devprotocol/clubs-core/connection'),
    ])

    connection.value = _connection
    _connection().account.subscribe(async (acc) => {
      if (acc) {
        connected.value = true
      }
    })
  })
})
</script>

<template>
  <button
    class="hs-button is-large flex justify-center gap-2 rounded-full py-3 text-white"
    :disabled="
      isAdded || isLimitedPreview || !connected || isAddingPluginToClubs
    "
    :title="addingPluginToClubsStatusMsg"
    @click="addPluginToClub"
    v-bind:class="
      isAddingPluginToClubs
        ? 'bg-success-300 cursor-progress'
        : isAdded || isLimitedPreview || !connected
        ? 'cursor-not-allowed bg-native-blue-200'
        : 'bg-success-300 cursor-pointer'
    "
  >
    <span
      v-if="addingPluginToClubsStatusMsg"
      role="presentation"
      class="h-3 w-3 animate-spin rounded-full border-l border-r border-t border-white"
    />
    {{ isAdded ? 'Added' : isLimitedPreview ? 'Limited Preview' : 'Add' }}
  </button>
</template>
