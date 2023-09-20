<script lang="ts">
import { onMount } from 'svelte';

import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'

import type { SlotLeft } from './types';
import type { Collection } from '@plugins/collections';

export let clubName: string | undefined = undefined


export let collection: Collection


    let difference;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

  const calculateTimeLeft = () => {
    difference = collection.endTime ? collection.endTime - Math.floor(new Date().getTime() / 1000) : 0;

    if (difference > 0) {
      days = Math.floor(difference / (60 * 60 * 24));
      hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      minutes = Math.floor((difference % (60 * 60)) / 60);
      seconds = difference % 60;
    }
    else {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;
    }
  };

  const getColStart = (i: number) =>
    i === 0
      ? 'lg:col-start-1'
      : i === 1
      ? 'lg:col-start-2'
      : i === 2
      ? 'lg:col-start-3'
      : i === 3
      ? 'lg:col-start-4'
      : i === 4
      ? 'lg:col-start-5'
      : i === 5
      ? 'lg:col-start-6'
      : i === 6
      ? 'lg:col-start-7'
      : i === 7
      ? 'lg:col-start-8'
      : 'lg:col-start-9'

  onMount(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex flex-col px-9">
    <!-- Header
    <div class="h-20 p-5 flex justify-between items-center gap-6">
        <div class="text-white text-lg font-medium uppercase">Demo</div>
        <button class="px-4 py-2 text-white text-lg font-medium uppercase border rounded-sm opacity-50">Sign in</button>
    </div> -->
    <!-- Hero Image -->
    <div class="gap-12">
        <img class="md:w-[896px] rounded-[32px]"
        src={collection.imageSrc}
        alt={`${collection.name}-cover-image`}
        />
    </div>

    <div class="flex flex-col items-start gap-12">
        <div class="flex flex-col items-start gap-[76px]">
            <!-- Collection Name -->
            <div class="flex items-center gap-2.5">
                <div class="text-justify">
                <span class="text-2xl font-bold leading-9">{collection.name}</span>
                </div>
            </div>  
            <!-- Collection Description -->
            <div class="flex flex-col items-start self-stretch gap-2.5">
                <p class="text-justify text-2xl font-normal">
                    {collection.description}
                </p>
            </div>
            <!-- Allowlist -->
            <div class="flex flex-col items-start self-stretch">
                <div class="flex p-5 flex-col items-start self-stretch gap-[20px] bg-[#17171780] rounded-[10px]">
                    <span class="text-justify text-3xl font-medium">
                        Exclusive to the following members.
                    </span>
                    <div class="flex flex-col items-start self-stretch">
                        <div class="flex p-5 flex-col items-start self-stretch gap-3 bg-[#27272780] rounded-[10px]">
                            <span class="text-justify text-3xl font-medium">
                                You don't seem to have it yet, but you can get it here.
                            </span>
                        </div>
                    </div>
                    <!-- Aceess -->
                    <div class="flex flex-col items-start">
                        <div class="flex p-5 items-center gap-3 bg-[#43C451] rounded-[10px]">
                            <div class="h-16 w-16">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                                    <path d="M13.334 34.6666L24.0007 45.3333L50.6673 18.6666" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                  </svg>
                            </div>
                            <p class="text-justify text-3xl font-medium">
                                Welcome, you have the access
                            </p>
                        </div>
                    </div>
                    <!-- Memberships -->
                    <div class="flex flex-col items-start gap-[7px]">
                        <div class="flex items-start gap-16">
                            <MembershipOption
                            clubName={'Your Club'}
                            id={'2'}
                            name={'Membership Name'}
                            imagePath={'https://i.ibb.co/Kyjr50C/Image.png'}
                            currency={'ETH'}
                            price={"0.1"}
                            description={'Membership Description'}
                            className={`lg:row-start-3 ${getColStart(0)}`}
                          />
                          <MembershipOption
                            clubName={'Your Club'}
                            id={'3'}
                            name={'Membership Name'}
                            imagePath={'https://i.ibb.co/nrdKDQy/Image-1.png'}
                            currency={'DEV'}
                            price={"0.1"}
                            description={'Membership Description'}
                            className={`lg:row-start-3 ${getColStart(1)}`}
                          />
                        </div>
                    </div>
                </div>
            </div>
            <!-- Validation -->
            <div class="flex flex-col items-start self-stretch">
                <div class="flex p-5 flex-col items-start self-stretch gap-3 rounded-[10px] bg-[#17171780]">
                    <span class="text-justify text-2xl font-medium">
                        Waiting for the wallet connection to confirm access rights.
                    </span>
                </div>
            </div>
            <!-- Time left -->
            {#if collection.isTimeLimitedCollection }
                <div class="flex p-5 flex-col justify-center items-center self-stretch rounded-[10px] bg-white gap-3">
                    <span class="text-justify text-2xl text-black font-medium leading-6">
                        Time remaining
                    </span>
                    <span class="text-justify text-3xl text-black font-medium leading-6">
                        {days} {days > 1 ? 'days' : 'day'}
                        {hours} {hours > 1 ? 'hours' : 'hour'}
                        {minutes} {minutes > 1 ? 'minutes' : 'minute'}
                        {seconds} {seconds > 1 ? 'seconds' : 'second'}
                    </span>
                </div>
            {/if}
            <!-- Memberships -->
            <div class="grid grid-cols-3 justify-between gap-4">
                {#each collection.memberships as mem, i}
                    <MembershipOption
                        clubName={clubName ?? 'Your Club'}
                        id={mem.id}
                        name={mem.name}
                        imagePath={mem.imageSrc}
                        price={mem.price.toString()}
                        currency={mem.currency}
                        description={mem.description}
                        className={`lg:row-start-3 ${getColStart(i)}`}
                    />
                {/each}
            </div>
        </div>
    </div>     
</div>