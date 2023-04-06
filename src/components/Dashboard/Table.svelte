<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { detectStokensByPropertyAddress } from '@fixtures/dev-kit'
  import { providers } from 'ethers'
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
        <th scope="col" class="px-6 py-3"> Date </th>
        <th scope="col" class="px-6 py-3"> Tokenised asset </th>
        <th scope="col" class="px-6 py-3"> Members </th>
      </tr>
    </thead>
    <tbody>
      {#each config as club}
        <tr class="border-b bg-white dark:border-gray-700 dark:bg-gray-900">
          <td class="px-6 py-4">
            <a
              href={club.config.url}
              target="_blank"
              rel="noreferrer"
              class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
              >{club.config.name}</a
            >
          </td>
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
              ? 'ℹ️'
              : '✅'}
          </td>
          <td class="px-6 py-4">
            {club.date?.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            }) ?? 'Unknown'}
          </td>
          <td class="px-6 py-4">
            {club.config.options?.find((option) => option.key === '__draft')
              ?.value.category}
          </td>
          <td class="px-6 py-4">
            {#await detectStokensByPropertyAddress(new providers.JsonRpcProvider(club.config.rpcUrl), club.config.propertyAddress)}
              <span
                class="block animate-pulse rounded bg-gray-500/60 text-5xl text-transparent"
                >0</span
              >
            {:then members}
              <span>{members?.length}</span>
            {/await}
          </td></tr
        >
      {/each}
    </tbody>
  </table>
</div>
