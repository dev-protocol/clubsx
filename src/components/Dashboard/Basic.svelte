<script lang="ts">
  import { onMount } from 'svelte'
  import Table from './Table.svelte'
  import type { ClubWithStats, Stats } from '@pages/api/stats/types'

  let isLoading = true
  let lastUpdate: Date
  let allClubs: ClubWithStats[] = []
  let publishedClubs = 0
  let uniqueCreators = 0
  let unPublishedClubs = 0
  let totalPublishedClubsMembers = 0

  const fetchTotalClubs = async () => {
    try {
      const [acReq] = await Promise.allSettled([
        fetch('/api/stats/allClubs'),
        // fetch('/api/stats?uniqueCreators', { method: 'POST' }),
      ])

      if (!acReq || acReq.status !== 'fulfilled' || !acReq.value.ok) {
        throw new Error('Failed to fetch clubs data')
      }
      // if (!ucRep || ucRep.status !== 'fulfilled' || !ucRep.value.ok) {
      //   throw new Error('Failed to fetch unique creators data')
      // }

      const stats = (await acReq.value.json()) as { data: Stats }
      console.log({ stats })
      allClubs = stats.data.clubs
      lastUpdate = new Date(stats.data.lastUpdate)
      publishedClubs = stats.data.publishedClubsWithMembers
      uniqueCreators = stats.data.uniqueCreators
      unPublishedClubs = stats.data.unpublished
      totalPublishedClubsMembers = stats.data.publishedClubsMembers
      // uniqueCreators = await ucRep.value
      //   .json()
      //   .then((res) => res.uniqueCreators)

      // for (const club of allclubs) {
      //   const { date, config } = club
      //   const decoded = decode(config)
      //   const isDraft = decoded.options?.find(
      //     (option: { key: string }) => option.key === '__draft',
      //   ) as DraftOptions | undefined
      //   if (!isDraft?.value.isInDraft) {
      //     publishedClubs++
      //   }
      //   allClubs.push({ date: new Date(date), config: decoded })
      // }
      // allClubs.sort((a, b) => b.date.getTime() - a.date.getTime())
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
      class="border-native-blue-400 max-w-md justify-start rounded-lg border border-[3px] bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
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
        ✅ Published <span class="text-xs"> (With > 0 Members)</span>: {publishedClubs}
      </p>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        🙋🏻‍♂️ Members of Published Clubs : {totalPublishedClubsMembers}
      </p>
      <p class="text-base text-gray-600 dark:text-gray-400">
        ℹ️ In Draft: {unPublishedClubs}
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        ⏰ Last updated: {lastUpdate.toLocaleString()}
      </p>
    </div>
    <div class="w-3/4 items-center justify-center py-8">
      <Table config={[...allClubs]} />
    </div>
  {/if}
</div>
