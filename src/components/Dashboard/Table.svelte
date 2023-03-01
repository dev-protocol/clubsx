<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  type TotalClubs = {
    date: Date
    config: ClubsConfiguration
  }

  export let config: TotalClubs[]
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
        <th scope="col" class="px-6 py-3"> Action </th>
        <th scope="col" class="px-6 py-3"> Date </th>
      </tr>
    </thead>
    <tbody>
      {#each config as club}
        <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-900">
          <th
            scope="row"
            class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
          >
            {club.config.name}
          </th>
          <td class="px-6 py-4">
            {club.config.chainId === 1
              ? 'Ethereum'
              : club.config.chainId === 137
              ? 'Polygon'
              : club.config.chainId === 4
              ? 'Rinkeby'
              : club.config.chainId === 80001
              ? 'Mumbai'
              : 'Unknown'}
          </td>
          <td class="px-6 py-4">
            {club.config.options?.find((option) => option.key === '__draft')
              ?.value.isInDraft
              ? 'Draft'
              : 'Published'}
          </td>
          <td class="px-6 py-4">
            <a
              href={club.config.url}
              target="_blank"
              rel="noreferrer"
              class="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >Link</a
            >
          </td>
          {#if club.date}
            <td class="px-6 py-4">
              {new Date(club.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </td>
          {:else}
            <td class="px-6 py-4">Unknown</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
