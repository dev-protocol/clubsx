<script lang="ts">
  import { onMount } from 'svelte'

  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'

  import type { SlotLeft } from './types'
  import type { Collection } from '@plugins/collections'
  import memberships from '@plugins/memberships'

  export let clubName: string | undefined = undefined

  export let collection: Collection

  let difference
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0

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

  onMount(() => {
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
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

  <div class="flex flex-col items-start gap-20 lg:px-9">
    <div class="flex flex-col items-start gap-[76px]">
      <!-- Collection Name -->
      <div class="flex items-center gap-2.5">
        <div class="text-justify">
          <span class="text-2xl font-bold leading-9">{collection.name}</span>
        </div>
      </div>
      <!-- Collection Description -->
      <div class="flex flex-col items-start gap-2.5 self-stretch">
        <p class="text-justify text-2xl font-normal">
          {collection.description}
        </p>
      </div>
      <!-- Allowlist -->
      <div class="flex flex-col items-start self-stretch">
        <div
          class="flex flex-col items-start gap-5 self-stretch rounded-md bg-[#17171780] p-5"
        >
          <span class="text-justify text-2xl font-medium text-white">
            Exclusive to the following members.
          </span>
          <div class="flex flex-col items-start self-stretch">
            <div
              class="flex flex-col items-start gap-3 self-stretch rounded-[10px] bg-[#27272780] p-5"
            >
              <span class="text-justify text-2xl font-medium text-white">
                You don't seem to have it yet, but you can get it here.
              </span>
            </div>
          </div>
          <!-- Aceess -->
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-3 rounded-md bg-dp-green-300 p-5">
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
              <p class="text-justify text-2xl font-medium text-white">
                Welcome, you have the access
              </p>
            </div>
          </div>
          <!-- Memberships -->
          <div
            class="grid w-full grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))] justify-between gap-4"
          >
            {#each collection.memberships as mem}
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
              />
            {/each}
          </div>
        </div>
      </div>
      <!-- Validation -->
      <div class="flex flex-col items-start self-stretch">
        <div
          class="flex flex-col items-start gap-3 self-stretch rounded-[10px] bg-[#17171780] p-5"
        >
          <span class="text-justify text-2xl font-medium text-white">
            Waiting for the wallet connection to confirm access rights.
          </span>
        </div>
      </div>
      <!-- Time left -->
      {#if collection.isTimeLimitedCollection}
        <div
          class="flex flex-col items-center justify-center gap-3 self-stretch rounded-[10px] bg-white p-5"
        >
          <span class="text-justify text-2xl font-medium leading-6 text-black">
            Time remaining
          </span>
          <span class="text-justify text-3xl font-medium leading-6 text-black">
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
          <MembershipOption
            clubName={clubName ?? 'Your Club'}
            id={mem.id}
            name={mem.name}
            imagePath={mem.imageSrc}
            price={mem.price.toString()}
            currency={mem.currency}
            description={mem.description}
          />
        {/each}
      </div>
    </div>
  </div>
</div>
