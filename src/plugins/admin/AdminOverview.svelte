<script lang="ts">
  import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'
  import {
    detectStokensByPropertyAddress,
    calculateRewardAmount,
  } from '@fixtures/dev-kit'
  import { whenDefined } from '@devprotocol/util-ts'
  import { onMount } from 'svelte'
  import { ethers, BigNumber, providers } from 'ethers'
  import { usdByDev } from '@fixtures/coingecko/api'
  export let config: ClubsConfiguration

  let { propertyAddress, rpcUrl } = config
  const provider = new providers.JsonRpcProvider(rpcUrl)
  let members: number | undefined = 0
  let earningsInDev: number | undefined
  let earnings: number | undefined
  async function getData() {
    await detectStokensByPropertyAddress(provider, propertyAddress).then(
      (res) => {
        members = res?.length
      }
    )
    await calculateRewardAmount(provider, propertyAddress).then((res) => {
      whenDefined(res, async (value) => {
        earningsInDev = Math.round((Number(value[0]) / 1e36) * 100) / 100
        earnings = await usdByDev(earningsInDev)
      })
    })
  }
  onMount(async () => {
    await getData()
  })
</script>

<div class="grid gap-16">
  <section class="grid grid-cols-2 items-stretch justify-between gap-16">
    <div
      class="grid gap-16 rounded-lg border border-[3px] border-native-blue-400 p-8"
    >
      <span class="font-title text-lg font-bold">Number of members</span>
      {#if members}
        <span class="text-5xl"
          >{members.toLocaleString('en', { useGrouping: true })}</span
        >
      {:else}
        <span
          class="block animate-pulse rounded bg-gray-500/60 text-5xl text-transparent"
          >0</span
        >
      {/if}
    </div>

    <div
      class="grid gap-16 rounded-lg border border-[3px] border-native-blue-400 p-8"
    >
      <span class="font-title text-lg font-bold">Total earnings</span>
      <div class="grid gap-2">
        {#if typeof earnings === 'number' && typeof earningsInDev === 'number'}
          <span class="truncate text-5xl"
            >${earnings.toLocaleString('en', { useGrouping: true })}</span
          >
          <span class="text-sm"
            >({earningsInDev.toLocaleString('en', { useGrouping: true })} DEV)</span
          >
        {:else}
          <span
            class="block animate-pulse rounded bg-gray-500/60 text-5xl text-transparent"
            >0</span
          >
          <span
            class="block w-2/4 animate-pulse rounded bg-gray-500/60 text-sm text-transparent"
            >0</span
          >
        {/if}
      </div>
    </div>
  </section>

  <section class="group grid gap-8">
    <h1 class="font-title text-lg font-bold">Chart</h1>
    <div class="relative">
      <img
        src="https://i.imgur.com/LnBRqBi.png"
        alt="chart"
        class="transition-opacity group-hover:opacity-10"
      />
      <div
        class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <p class="rounded-md bg-dp-blue-grey-600 px-6 py-4">
          Charts will be available in future updates.
        </p>
      </div>
    </div>
  </section>
</div>
