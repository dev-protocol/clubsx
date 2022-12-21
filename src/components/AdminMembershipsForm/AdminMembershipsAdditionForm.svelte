<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import { Membership } from '@plugins/memberships'

  export let currentPluginIndex: number
  export let presets: Membership[]
  export let membership: Membership
  export let existingMemberships: Membership[]

  const update = () => {
    const newMemberships = existingMemberships.some(
      ({ id }) => id === membership.id
    )
      ? // If the ID is already exists, override it. This is a safeguard to avoid duplicate data.
        existingMemberships.map((_mem) =>
          _mem.id === membership.id ? membership : _mem
        )
      : // If not, add it.
        [...existingMemberships, membership]
    setOptions(
      [{ key: 'memberships', value: { memberships: newMemberships } }],
      currentPluginIndex
    )
  }

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files || !membership) {
      return
    }

    const file = e.currentTarget.files[0]

    membership.imageSrc = await uploadImageAndGetPath(file)

    membership = membership

    update()
  }
</script>

<div>
  <div class="mb-8 grid grid-cols-3 gap-4">
    {#each presets as opt, i}
      <div>
        <MembershipOptionCard
          name={opt.name}
          imagePath={opt.imageSrc}
          ethPrice={opt.price.toString()}
          description={opt.description}
        />
      </div>
    {/each}
  </div>

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

            {#if membership.imageSrc && membership.imageSrc != ''}
              <img
                src={membership.imageSrc}
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
            bind:value={membership.price}
            id="membership-price"
            name="membership-price"
          />
        </div>

        <!-- Subscription Streaming -->
        <div class="rounded border border-blue-500 px-4 py-2">
          <span class="mb-4 font-title font-bold">Subscription Streaming</span>

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
            imagePath={membership.imageSrc}
            ethPrice={membership.price.toString()}
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
    </div>
  </div>
</div>
