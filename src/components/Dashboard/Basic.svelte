<script lang="ts">
  import { onMount } from 'svelte'
  import { decode } from '@devprotocol/clubs-core'
  import type { DraftOptions } from '@constants/draft'
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import Table from './Table.svelte'

  type ClubsData = {
    date: Date
    config: ClubsConfiguration
  }

  let isLoading = true
  let allClubs: ClubsData[] = []
  let publishedClubs = 0
  let uniqueCreators = 0

  const fetchTotalClubs = async () => {
    try {
      const [acReq, ucRep] = await Promise.allSettled([
        fetch('/api/stats?allClubs', { method: 'POST' }),
        fetch('/api/stats?uniqueCreators', { method: 'POST' }),
      ])

      if (!acReq || acReq.status !== 'fulfilled' || !acReq.value.ok) {
        throw new Error('Failed to fetch clubs data')
      }
      if (!ucRep || ucRep.status !== 'fulfilled' || !ucRep.value.ok) {
        throw new Error('Failed to fetch unique creators data')
      }

      const allclubs = await acReq.value.json()
      uniqueCreators = await ucRep.value
        .json()
        .then((res) => res.uniqueCreators)

      for (const club of allclubs) {
        const { date, config } = club
        const decoded = decode(config)
        const isDraft = decoded.options?.find(
          (option: { key: string }) => option.key === '__draft'
        ) as DraftOptions | undefined
        if (!isDraft?.value.isInDraft) {
          publishedClubs++
        }
        allClubs.push({ date: new Date(date), config: decoded })
      }
      allClubs.sort((a, b) => b.date.getTime() - a.date.getTime())
      // uncomment while debugging
      // console.log(allClubs)
    } catch (error) {
      console.error(error)
    } finally {
      isLoading = false
    }
  }

  onMount(async () => {
    try {
      await fetchTotalClubs()
    } catch (error) {
      console.error(error)
    }
    isLoading = false
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
      class="border-native-blue-400 max-w-sm justify-start rounded-lg border border-[3px] bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
    >
      <h5
        class="mb-2 text-center text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
      >
        Overview 🔍
      </h5>
      <p class="text-2xl text-gray-600 dark:text-gray-400">
        🔥 Total Clubs Created: {allClubs.length}
      </p>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        🖼️ Unique Creators: {uniqueCreators}
      </p>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        ✅ Published: {publishedClubs}
      </p>
      <p class="text-base text-gray-600 dark:text-gray-400">
        ℹ️ In Draft: {allClubs.length - publishedClubs}
      </p>
    </div>
    <div class="w-3/4 items-center justify-center py-8">
      <Table config={[...allClubs]} />
    </div>
  {/if}
</div>
