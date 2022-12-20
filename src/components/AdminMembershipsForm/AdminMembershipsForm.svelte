<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import type { MembershipOption } from './types'
  import membershipOpt1 from '@assets/membership-opt-1.png'
  import membershipOpt2 from '@assets/membership-opt-2.png'
  import membershipOpt3 from '@assets/membership-opt-3.png'
  import { uploadImageAndGetPath } from '@fixtures/imgur'

  export let currentPluginIndex: number

  const update = () => {
    setOptions([{ key: 'memberships', value: {} }], currentPluginIndex)
  }

  const membershipOptions: MembershipOption[] = [
    {
      name: 'Casual',
      imagePath: membershipOpt1,
      ethPrice: '0.003',
      description: 'lorem ipsum',
    },
    {
      name: 'Luxury',
      imagePath: membershipOpt2,
      ethPrice: '1',
      description: 'lorem ipsum',
    },
    {
      name: 'Edge',
      imagePath: membershipOpt3,
      ethPrice: '0.5',
      description: 'lorem ipsum',
    },
  ]

  let membership: MembershipOption

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files || !membership) {
      return
    }

    const file = e.currentTarget.files[0]

    membership.imagePath = await uploadImageAndGetPath(file)

    membership = membership
  }
</script>

<div>
  <div class="mb-8 grid grid-cols-3 gap-4">
    {#each membershipOptions as opt, i}
      <div>
        <MembershipOptionCard
          name={opt.name}
          imagePath={opt.imagePath}
          ethPrice={opt.ethPrice}
          description={opt.description}
        />
        <button
          class="mt-2 w-full rounded bg-black py-4 text-sm font-semibold text-white"
          id={`select-opt-${i}`}
          on:click={() => (membership = membershipOptions[i])}>Select</button
        >
      </div>
    {/each}
  </div>

  {#if membership}
    <div>
      <div class="mb-10 grid grid-cols-2 gap-8">
        <div>
          <!-- Name -->
          <div class="mb-10 flex flex-col">
            <label class="mb-1" for="membership-name"> Name </label>
            <input
              class="rounded bg-[#040B10] px-8 py-4"
              bind:value={membership.name}
              id="membership-name"
              name="membership-name"
            />
          </div>

          <!-- Image -->
          <div class="mb-10 flex flex-col">
            <label class="mb-1 flex flex-col" for="avatarPath">
              <span class="mb-1">Avatar</span>

              {#if membership.imagePath && membership.imagePath != ''}
                <img
                  src={membership.imagePath}
                  class="h-auto max-w-full cursor-pointer rounded"
                  alt="Hero"
                />
              {:else}
                <div class="float-left">
                  <span
                    class="cursor-pointer rounded-lg bg-[#040B10] px-12 py-4 text-sm font-medium"
                    type="button">Choose Image</span
                  >
                </div>
              {/if}
              <input
                id="avatarPath"
                name="avatarPath"
                style="display:none"
                type="file"
                on:change={onFileSelected}
              />
            </label>
          </div>

          <!-- Price -->
          <div class="mb-10 flex flex-col">
            <label class="mb-1" for="membership-price"> Price </label>
            <input
              class="rounded bg-[#040B10] px-8 py-4"
              bind:value={membership.ethPrice}
              id="membership-price"
              name="membership-price"
            />
          </div>

          <!-- Subscription Streaming -->
          <div class="rounded border border-blue-500 px-4 py-2">
            <span class="mb-4 font-title font-bold">Subscription Streaming</span
            >

            <div class="flex text-sm">
              <span class="mr-2 text-sm">Estimated Earnings/year: </span>
              <span class="text-sm">888.8888 USD (888.8888 DEV)</span>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="relative top-0">
          <div class="sticky top-4">
            <MembershipOptionCard
              name={membership.name}
              imagePath={membership.imagePath}
              ethPrice={membership.ethPrice}
              description={membership.description}
            />
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-10 flex flex-col">
        <label for="membership-description"> Description </label>
        <textarea
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={membership.description}
          id="membership-description"
          name="membership-description"
        />
        <p class="text-sm">Markdown is available</p>
      </div>

      <div class="flex w-full justify-end">
        <button>Cancel</button>
        <button>Add</button>
      </div>
    </div>
  {/if}
</div>
