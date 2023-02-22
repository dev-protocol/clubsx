<script lang="ts">
  import { onMount } from 'svelte'
  import { decode } from '@devprotocol/clubs-core'
  import type { DraftOptions } from '@constants/draft'
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import Table from './Table.svelte'

  let isLoading = true
  let draftNumber = 0
  let totalClubs: ClubsConfiguration[] = []

  const fetchTotalClubs = async () => {
    const req = await fetch('/api/stats', {
      method: 'POST',
    })
    if (req.status !== 200) {
      isLoading = false
      return
    }

    const clubs = await req.json()
    for (const club of clubs) {
      const decoded = decode(club)
      const isDraft = decoded.options?.find(
        (option: { key: string }) => option.key === '__draft'
      ) as DraftOptions | undefined
      console.log('before decoded = >', club)
      console.log('decoded = >', decoded)

      if (isDraft?.value.isInDraft) {
        draftNumber++
      }
      totalClubs.push(decoded)
      totalClubs = totalClubs
    }
    isLoading = false
  }
  onMount(async () => {
    await fetchTotalClubs()
  })
</script>

<div class="flex flex-col items-center justify-center">
  {#if isLoading}
    <div
      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        >Loading...</span
      >
    </div>
  {:else}
    <div
      class="max-w-sm rounded-lg border border-[3px] border-native-blue-400 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
    >
      <h5
        class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
      >
        Overview
      </h5>
      <p class="text-gray-600 dark:text-gray-400">
        Total Clubs Created: {totalClubs.length}
      </p>
      <p class="text-gray-600 dark:text-gray-400">
        Published: {totalClubs.length - draftNumber}
      </p>
      <p class="text-gray-600 dark:text-gray-400">In Draft: {draftNumber}</p>
    </div>
    <div class="w-3/4 py-8">
      <Table config={totalClubs} />
    </div>
  {/if}
</div>
