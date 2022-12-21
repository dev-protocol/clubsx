<script lang="ts">
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { whenDefined } from '@devprotocol/util-ts'
  import { onMount } from 'svelte'
  export let config: ClubsConfiguration

  let { propertyAddress, rpcUrl } = config
  // let members = []
  // let earnings = 0;
  // async function getData() {
  //   const clients = await clientsSTokens(rpcUrl)
  //   const sToken = whenDefined(clients, ([l1, l2]) => l1 ?? l2)
  //   members = await whenDefined(sToken, (contract) =>
  //       contract.positionsOfProperty(
  //         propertyAddress
  //       )
  //   )
  // }
  // onMount(async () => {
  //   await getData();
  // });
</script>

<div>
  <div class="flex flex-row space-x-24">
    <div
      class="h-[186px] w-[400px] rounded-lg border border-2 border-blue-400 py-12 px-12"
    >
      <div class="mb-10 flex items-center justify-between">
        <span class="font-title text-lg font-bold">Number of members</span>
      </div>
      <div class="flex flex-col">
        <span class="text-2xl font-normal">{members}</span>
      </div>
    </div>
    <div
      class="h-[186px] w-[400px] rounded-lg border border-2 border-blue-400 py-12 px-12"
    >
      <div class="mb-10 flex items-center justify-between">
        <span class="font-title text-lg font-bold">Total earnings</span>
      </div>
      <div class="flex">
        <div>
          <span class="text-2xl font-normal">{earnings} USD</span>
        </div>
        <div class="">
          <span class="ml-[28px] align-text-bottom text-sm font-normal"
            >({earnings} DEV)</span
          >
        </div>
      </div>
    </div>
  </div>
  <div>
    <h1 class="mt-[64px] mb-16 font-title text-lg font-bold">Chart</h1>
    <img src="https://i.imgur.com/LnBRqBi.png" alt="chart" />
  </div>
</div>
