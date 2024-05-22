<script lang="ts">
  /**
   * Imports
   */
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import {
    detectStokensByPropertyAddress,
    calculateRewardAmount,
  } from '@fixtures/dev-kit'
  import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
  import { onDestroy, onMount } from 'svelte'
  import { JsonRpcProvider, type Signer } from 'ethers'
  import { usdByDev } from '@fixtures/coingecko/api'
  import { clientsProperty } from '@devprotocol/dev-kit'
  import type { Subscription } from 'rxjs'
  import BigNumber from 'bignumber.js'
  import { clientsRegistry } from '@devprotocol/dev-kit'

  /**
   * Export Params
   */
  export let config: ClubsConfiguration

  /**
   * Component variables
   */
  let { propertyAddress, rpcUrl } = config
  const provider = new JsonRpcProvider(rpcUrl)
  let members: number | undefined = 0
  let earningsInDev: number | undefined
  let earnings: number | undefined
  let totalSupply: BigNumber | undefined
  let userBalance: BigNumber | undefined
  let treasuryBalance: BigNumber | undefined
  let connectionSub: Subscription

  /**
   * Component functions
   */
  async function getData() {
    await detectStokensByPropertyAddress(provider, propertyAddress).then(
      (res) => {
        members = res?.length
      },
    )
    await calculateRewardAmount(provider, propertyAddress).then((res) => {
      whenDefined(res, async (value) => {
        earningsInDev = Math.round((Number(value[0]) / 1e36) * 100) / 100
        earnings = (await usdByDev(earningsInDev)).price
      })
    })
  }

  const fetchTreasuryAddress = async () => {
    const registries = await clientsRegistry(provider)

    if (!registries || registries.length <= 0) {
      return
    }

    const registery = registries[1]

    if (!registery) {
      return
    }

    const treasuryAddress = await registery.registries('Treasury')

    return treasuryAddress
  }

  const getProperty = async () => {
    const propertyClient = await clientsProperty(
      provider,
      config.propertyAddress,
    )

    if (!propertyClient || propertyClient.length <= 0) {
      return false
    }

    return propertyClient[0] ?? propertyClient[1]
  }

  const fetchUserSupply = async (signer: UndefinedOr<Signer>) => {
    if (!signer) {
      userBalance = undefined
      return
    }

    const property = await getProperty()

    if (!property) {
      return
    }

    const [_userBalance, _totalSupply] = await Promise.all([
      whenDefined(
        await property?.balanceOf(await signer.getAddress()),
        BigNumber,
      ),
      whenDefined(await property?.totalSupply(), BigNumber),
    ])
    userBalance = _userBalance
    totalSupply = _totalSupply
  }

  const fetchTreasuryBalance = async () => {
    const property = await getProperty()

    if (!property) {
      return
    }

    const treasuryAddress = await fetchTreasuryAddress()

    treasuryBalance = await whenDefined(
      treasuryAddress,
      async (_treasuryAddress) =>
        new BigNumber(await property?.balanceOf(_treasuryAddress)),
    )
  }

  onMount(async () => {
    getData()

    fetchTreasuryBalance()

    const { connection } = await import('@devprotocol/clubs-core/connection')

    connectionSub = connection().signer.subscribe(async (signer) => {
      fetchUserSupply(signer)

      if (signer) {
        const hash = `Metawater Admin Signature: ${new Date().toISOString()}`
        console.log('hash is: ', hash)
        const sig = await signer.signMessage(hash)
        console.log('signature is: ', sig)
      }
    })
  })

  onDestroy(() => {
    connectionSub.unsubscribe()
  })
</script>

<div class="grid gap-16">
  <section class="grid grid-cols-2 items-stretch justify-between gap-16">
    <!-- Number of Members -->
    <div
      class="border-native-blue-400 grid gap-16 rounded-lg border border-[3px] p-8"
    >
      <span class="font-title text-lg font-bold">Number of members</span>
      {#if typeof members === 'number'}
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

    <!-- Total Earnings -->
    <div
      class="border-native-blue-400 grid gap-16 rounded-lg border border-[3px] p-8"
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

    <div
      class="border-native-blue-400 grid gap-16 rounded-lg border border-[3px] p-8"
    >
      <span class="font-title text-lg font-bold">Your Token Share</span>

      <div class="grid gap-2">
        {#if userBalance && totalSupply}
          <span class="truncate text-5xl"
            >{userBalance.div(totalSupply).times(100).dp(6)} %</span
          >
          <span class="text-sm"
            >({userBalance
              .div(1e18)
              .dp(6)
              .toNumber()
              .toLocaleString('en', { useGrouping: true })})</span
          >
        {:else}
          <span>Connect wallet</span>
        {/if}
      </div>
    </div>

    <div
      class="border-native-blue-400 grid gap-16 rounded-lg border border-[3px] p-8"
    >
      <span class="font-title text-lg font-bold">Treasury Token Share</span>

      <div class="grid gap-2">
        {#if treasuryBalance && totalSupply}
          <span class="truncate text-5xl"
            >{treasuryBalance.div(totalSupply).times(100).dp(6)} %</span
          >
          <span class="text-sm"
            >({treasuryBalance
              .div(1e18)
              .dp(6)
              .toNumber()
              .toLocaleString('en', { useGrouping: true })})</span
          >
        {:else}
          <span class="truncate text-5xl">- %</span>
          <span class="text-sm">(-)</span>
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
        <p class="bg-primary-400 rounded-md px-6 py-4">
          Charts will be available in future updates.
        </p>
      </div>
    </div>
  </section>
</div>
