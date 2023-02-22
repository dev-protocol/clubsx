<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'

  export let config: ClubsConfiguration[]
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
      </tr>
    </thead>
    <tbody>
      {#each config as club}
        <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-900">
          <th
            scope="row"
            class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
          >
            {club.name}
          </th>
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
            {club.options?.find((option) => option.key === '__draft')?.value
              .isInDraft
              ? 'Draft'
              : 'Published'}
          </td>
          <td class="px-6 py-4">
            <a
              href={`https://${club.name}.clubs.place`}
              target="_blank"
              rel="noreferrer"
              class="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >Link</a
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
