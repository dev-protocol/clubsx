<script lang="ts">
  import { onMount } from 'svelte'

  import { JsonRpcProvider, type Signer } from 'ethers'

  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import { checkMemberships } from '@fixtures/utility.ts'

  import type { SlotLeft } from './types'
  import { bytes32Hex } from '@devprotocol/clubs-core'
  import type { Collection, CollectionMembership } from '@plugins/collections'
  import type { Membership } from '@plugins/memberships'

  import { callSlotCollections } from '@plugins/collections/utils/slotCollections'

  export let clubName: string | undefined = undefined
  export let existingMemberships: Membership[] = []
  export let collection: Collection
  export let propertyAddress: string
  export let rpcUrl: string

  let currentAddress: string | undefined

  let difference
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0

  let validatingMembership: Boolean = true
  let validationResult: Boolean | 'processing' = 'processing'

  const requiredPayload = new Set(
    collection.requiredMemberships?.map((reqMem) => bytes32Hex(reqMem)) || [],
  )
  const requiredMemberships = existingMemberships.filter((mem) =>
    requiredPayload.has(bytes32Hex(mem.payload)),
  )
  const web3Provider = new JsonRpcProvider(rpcUrl)

  const requiredMembershipValidation = async () => {
    validationResult = 'processing'
    validatingMembership = true
    try {
      validationResult = await checkMemberships(
        web3Provider,
        propertyAddress,
        requiredMemberships,
        currentAddress,
      )
    } catch (e) {
      console.error(e)
      if (requiredMemberships.length === 0) validationResult = true
      else validationResult = false
    }
    validatingMembership = false
  }

  const calculateTimeLeft = () => {
    difference = collection.endTime
      ? collection.endTime - Math.floor(new Date().getTime() / 1000)
      : 0

    if (difference > 0) {
      days = Math.floor(difference / (60 * 60 * 24))
      hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60))
      minutes = Math.floor((difference % (60 * 60)) / 60)
      seconds = difference % 60
    } else {
      days = 0
      hours = 0
      minutes = 0
      seconds = 0
    }
  }

  const getSlotsForMembership = async (membership: CollectionMembership) => {
    if (membership.memberCount === 0) return undefined
    const provider = new JsonRpcProvider(rpcUrl)
    let left = await callSlotCollections(provider, 'getSlotsLeft', [
      propertyAddress,
      bytes32Hex(membership.payload),
    ])
    left = Number(left)
    const total = membership.memberCount
    console.log({ left, total })
    return { left, total } as SlotLeft
  }

  onMount(async () => {
    calculateTimeLeft()
    setInterval(calculateTimeLeft, 1000)
    const { connection } = await import('@devprotocol/clubs-core/connection')
    connection().account.subscribe((a) => {
      currentAddress = a
      requiredMembershipValidation()
    })
  })
</script>

<div class="flex flex-col gap-8">
  <!-- Header
    <div class="h-20 p-5 flex justify-between items-center gap-6">
        <div class="text-white text-lg font-medium uppercase">Demo</div>
        <button class="px-4 py-2 text-white text-lg font-medium uppercase border rounded-sm opacity-50">Sign in</button>
    </div> -->
  <!-- Hero Image -->
  <img
    class="rounded-xl"
    src={collection.imageSrc}
    alt={`${collection.name}-cover-image`}
  />

  <div class="flex flex-col gap-10 lg:gap-20 lg:px-5">
    <!-- Collection Name -->
    <div class="flex items-center gap-2.5">
      <div class="text-justify">
        <span class="text-3xl font-bold leading-9">{collection.name}</span>
      </div>
    </div>
    <!-- Collection Description -->
    <p class="text-xl font-normal">
      {collection.description}
    </p>
    {#if requiredMemberships.length > 0}
      <!-- Allowlist -->
      <div class="flex flex-col items-start self-stretch">
        <div
          class="flex flex-col items-start gap-5 self-stretch rounded-md bg-[#17171780] p-5"
        >
          {#if validationResult !== true}
            <span class="text-xl lg:text-2xl text-white">
              Exclusive to the following members.
            </span>
          {/if}
          <!-- Validation -->
          {#if !validationResult}
            <div class="flex flex-col items-start self-stretch">
              <div
                class="flex flex-col items-start gap-3 self-stretch rounded-md bg-black p-5"
              >
                {#if currentAddress === undefined}
                  <span
                    class="text-xl lg:text-2xl font-medium text-white animate-pulse"
                  >
                    Waiting for the wallet connection to confirm access rights.
                  </span>
                {:else}
                  <span class="text-white text-xl lg:text-3xl">
                    You don't seem to have it yet, but you can get it here.
                  </span>
                {/if}
              </div>
            </div>
          {/if}
          {#if validationResult === true}
            <div
              class="flex items-start items-center gap-3 rounded-md bg-dp-green-300 p-5 w-full"
            >
              <div class="h-16 w-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <path
                    d="M13.334 34.6666L24.0007 45.3333L50.6673 18.6666"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <p class="text-xl lg:text-2xl text-white">
                Welcome, you have the access
              </p>
            </div>
          {/if}
          {#if validationResult === 'processing'}
            <div class="flex items-center justify-center space-x-2">
              <div
                class="w-4 h-4 rounded-full animate-pulse dark:bg-orange-200"
              ></div>
              <div
                class="w-4 h-4 rounded-full animate-pulse dark:bg-orange-300"
              ></div>
              <div
                class="w-4 h-4 rounded-full animate-pulse dark:bg-orange-400"
              ></div>
            </div>
          {/if}
          {#if validationResult !== true}
            <!-- Required Memberships -->
            <div
              class="grid w-full grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))] justify-between gap-4"
            >
              {#each requiredMemberships as mem, i}
                <MembershipOption
                  clubName={clubName ?? ''}
                  id={mem.id}
                  name={mem.name}
                  imagePath={mem.imageSrc}
                  currency={mem.currency}
                  price={mem.price.toString()}
                  description={mem.description}
                  action={`/join/${mem.id}`}
                  actionLabel={'Purchase'}
                  slotOutTotal={undefined}
                />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
    <!-- Time left -->
    {#if collection.endTime !== undefined && collection.endTime > 0}
      <div
        class="flex flex-col items-center justify-center gap-3 self-stretch rounded-[10px] bg-white p-5"
      >
        <span class="text-justify text-2xl text-black"> Time remaining </span>
        <span class="text-xl text-center lg:text-3xl font-bold text-black">
          {days}
          {days > 1 ? 'days' : 'day'}
          {hours}
          {hours > 1 ? 'hours' : 'hour'}
          {minutes}
          {minutes > 1 ? 'minutes' : 'minute'}
          {seconds}
          {seconds > 1 ? 'seconds' : 'second'}
        </span>
      </div>
    {/if}
    <!-- Memberships -->
    <div
      class="grid grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))] justify-between gap-4"
    >
      {#each collection.memberships as mem, i}
        {#if validationResult === true}
          {#await getSlotsForMembership(mem) then slots}
            {#if !mem.deprecated}
              <MembershipOption
                clubName={clubName ?? 'Your Club'}
                id={mem.id}
                name={mem.name}
                imagePath={mem.imageSrc}
                price={mem.price.toString()}
                currency={mem.currency}
                description={mem.description}
                action={`/collections/checkout/${bytes32Hex(mem.payload)}`}
                actionLabel="Purchase"
                slotOutTotal={slots}
              />
            {/if}
          {/await}
        {/if}
      {/each}
    </div>
  </div>
</div>
