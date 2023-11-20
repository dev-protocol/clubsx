<script lang="ts">
  import type { ClubWithStats } from '@pages/api/stats/types'

  export let config: ClubWithStats[]
  const statusOf = (club: ClubWithStats) => (club.draft ? 'ℹ️' : '✅')
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
    <thead
      class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400"
    >
      <tr>
        <th scope="col" class="px-6 py-3"> Clubs Name </th>
        <th scope="col" class="px-6 py-3"> Blockchain </th>
        <th scope="col" class="px-6 py-3"> Status </th>
        <!-- <th scope="col" class="px-6 py-3"> Date </th> -->
        <!-- <th scope="col" class="px-6 py-3"> Tokenised asset </th> -->
        <th scope="col" class="px-6 py-3"> Members </th>
      </tr>
    </thead>
    <tbody>
      {#each config as club}
        <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-900">
          <td class="px-6 py-4">
            <a
              href={club.url}
              target="_blank"
              rel="noreferrer"
              class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
              >{club.name}</a
            >
          </td>
          <td class="px-6 py-4">
            {club.chainId === 1
              ? 'Ethereum'
              : club.chainId === 137
                ? 'Polygon'
                : club.chainId === 4
                  ? 'Rinkeby'
                  : club.chainId === 80001
                    ? 'Mumbai'
                    : 'Unknown'}
          </td>
          <td class="px-6 py-4">
            {statusOf(club)}
          </td>
          <!-- <td class="px-6 py-4">
            {club.date?.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            }) ?? 'Unknown'}
          </td> -->
          <!-- <td class="px-6 py-4">
            {categoryOf(club)}
          </td> -->
          <td class="px-6 py-4">
            <span>{club.stats.members}</span>
          </td></tr
        >
      {/each}
    </tbody>
  </table>
</div>
