<script lang="ts">
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'
  import {
    detectStokensByPropertyAddress,
    calculateRewardAmount,
  } from '@fixtures/dev-kit'
  import { whenDefined } from '@devprotocol/util-ts'
  import { onMount } from 'svelte'
  import { providers } from 'ethers'
  export let config: ClubsConfiguration

  let { propertyAddress, rpcUrl } = config
  const provider = new providers.JsonRpcProvider(rpcUrl)
  let members: number | undefined = 0
  let earnings: number
  async function getData() {
    await detectStokensByPropertyAddress(provider, propertyAddress).then(
      (res) => {
        members = res?.length
      }
    )
    await calculateRewardAmount(provider, propertyAddress).then((res) => {
      whenDefined(res, (value) => {
        earnings = Number(value[0]) / 10 ** 18
      })
    })
  }
  onMount(async () => {
    await getData()
  })
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
