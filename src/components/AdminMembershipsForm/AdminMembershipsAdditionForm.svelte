<script lang="ts">
  import { setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import { Membership } from '@plugins/memberships'
  import {
    UndefinedOr,
    whenDefined,
    whenDefinedAll,
  } from '@devprotocol/util-ts'
  import { providers, utils } from 'ethers'
  import {
    positionsCreateWithEth,
    estimationsAPY,
  } from '@devprotocol/dev-kit/agent'
  import { usdByDev } from '@fixtures/coingecko/api'
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'

  export let currentPluginIndex: number
  export let presets: UndefinedOr<Membership[]> = undefined
  export let membership: Membership
  export let existingMemberships: Membership[]
  export let base: string = '/admin'
  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  let estimatedEarnings: { dev?: number; usd?: number } = {
    dev: undefined,
    usd: undefined,
  }
  const originalId = membership.id
  const provider = new providers.JsonRpcProvider(rpcUrl)

  onMount(() => {
    onChangePrice()
  })

  const update = () => {
    const search = mode === 'edit' ? originalId : membership.id
    const payload = mode === 'edit' ? membership.payload : utils.randomBytes(8)
    const newMemberships = existingMemberships.some(({ id }) => id === search)
      ? // If the ID is already exists, override it. This is a safeguard to avoid duplicate data.
        existingMemberships.map((_mem) =>
          _mem.id === search ? { ...membership, payload } : _mem
        )
      : // If not, add it.
        [...existingMemberships, { ...membership, payload }]

    setOptions(
      [{ key: 'memberships', value: newMemberships }],
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

  const onChangeName = () => {
    const id = membership.name.toLowerCase().replace(/\W/g, '-')
    membership.id = id
  }

  const onChangePrice = async () => {
    if (membership.price === 0) {
      estimatedEarnings = { dev: 0, usd: 0 }
      return
    }
    estimatedEarnings = {}
    const [[, devApy], stakingEstimation] = await Promise.all([
      estimationsAPY({ provider }),
      positionsCreateWithEth({
        provider,
        ethAmount: utils.parseEther(membership.price.toString()).toString(),
        destination: '',
        gatewayBasisPoints: new BigNumber(10000)
          .times(membership.fee?.percentage ?? 0)
          .toNumber(),
      }),
    ])
    const dev = whenDefinedAll([devApy, stakingEstimation], ([apy, stake]) =>
      new BigNumber(utils.formatUnits(stake.estimatedDev).toString())
        .times(apy)
        .dp(2)
        .toNumber()
    )
    const usd = await whenDefined(dev, usdByDev)?.then((x) =>
      new BigNumber(x).dp(2).toNumber()
    )
    estimatedEarnings = {
      dev,
      usd,
    }
  }

  const cancel = () => {
    const preset = existingMemberships.find(
      (preset) => preset.id === membership.id
    )
    if (!preset) {
      console.error('no matching preset found for: ', membership.id)
      return
    }
    membership = preset
  }
</script>

<div class="grid gap-16">
  {#if presets}
    <div class="max-w-full overflow-x-scroll">
      <div class="flex flex-nowrap gap-4">
        {#each presets as opt, i}
          <div>
            <MembershipOptionCard
              name={opt.name}
              imagePath={opt.imageSrc}
              ethPrice={opt.price.toString()}
              description={opt.description}
              className={originalId === opt.id
                ? 'border-[3px] border-native-blue-300 w-32'
                : 'opacity-30 w-32'}
            />
            <a
              class="mt-2 block w-full rounded bg-black py-4 text-center text-sm font-semibold text-white"
              id={`select-opt-${i}`}
              href={`${base}/memberships/new/${opt.id}`}
              >{originalId === opt.id ? 'Selected' : 'Select'}</a
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <form on:change|preventDefault={(_) => update()} class="grid gap-16">
    <div class="grid gap-16 lg:grid-cols-[3fr_2fr]">
      <!-- Form -->
      <div class="grid gap-8">
        <!-- Name -->
        <div class="flex flex-col gap-1">
          <label for="membership-name"> Name </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={membership.name}
            on:change={onChangeName}
            id="membership-name"
            name="membership-name"
          />
        </div>

        <!-- Image -->
        <div class="flex flex-col gap-1">
          <label class="flex flex-col gap-1" for="avatarPath">
            <span>Image</span>

            {#if membership.imageSrc && membership.imageSrc != ''}
              <img
                src={membership.imageSrc}
                class="h-auto max-w-full cursor-pointer rounded"
                alt="Hero"
              />
            {/if}
            <span
              class="hs-button cursor-pointer rounded-lg bg-[#040B10] px-12 py-4 text-sm font-medium text-white"
              type="button">Choose Image</span
            >
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
        <div class="flex flex-col gap-1">
          <label for="membership-price"> Price </label>
          <input
            class="rounded bg-[#040B10] px-8 py-4"
            bind:value={membership.price}
            on:change={onChangePrice}
            id="membership-price"
            name="membership-price"
            type="number"
          />
        </div>

        <!-- Subscription Streaming -->
        <div class="rounded-lg border-[3px] border-blue-500 px-4 py-6">
          <h3 class="mb-8 font-title font-bold">Subscription Streaming</h3>

          <div class="grid gap-2">
            <p class="text-sm">Estimated Earnings/year:</p>
            {#if estimatedEarnings.usd === undefined || estimatedEarnings.dev === undefined}
              <p
                class="h-[2rem] w-full animate-pulse cursor-progress rounded bg-gray-500/60"
              />
            {:else}
              <p>
                {estimatedEarnings.usd} USD ({estimatedEarnings.dev} DEV)
              </p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="relative top-0">
        <h3>Preview</h3>
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
    <div class="flex flex-col">
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
      <button type="button" on:click|preventDefault={() => cancel()}
        >Cancel</button
      >
    </div>
  </form>
</div>
