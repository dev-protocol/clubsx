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
  import { clientsSTokens } from '@devprotocol/dev-kit'

  export let currentPluginIndex: number
  export let presets: UndefinedOr<Membership[]> = undefined
  export let membership: Membership
  export let existingMemberships: Membership[]
  export let base: string = '/admin'
  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined
  let estimatedEarnings: {
    dev?: [number, number]
    usd?: [number, number]
  } = {
    dev: undefined,
    usd: undefined,
  }
  let usersDeposit: {
    dev?: [number, number]
    usd?: [number, number]
  } = {
    dev: undefined,
    usd: undefined,
  }
  const originalId = membership.id
  const provider = new providers.JsonRpcProvider(rpcUrl)
  let membershipExists = false
  let loading = false

  onMount(() => {
    onChangePrice()
    fetchPositionsOfProperty()
    update()
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

  const toDp2 = (v: number | string) => new BigNumber(v).dp(2).toNumber()
  const onChangePrice = async () => {
    if (membership.price === 0) {
      estimatedEarnings = { dev: [0, 0], usd: [0, 0] }
      usersDeposit = { dev: [0, 0], usd: [0, 0] }
      return
    }
    estimatedEarnings = { dev: [0, 0], usd: [0, 0] }
    usersDeposit = { dev: [0, 0], usd: [0, 0] }

    /**
     * devApy: $DEV APY for creator
     * staking: Estimation for $DEV staking
     */
    const [[, devApy], staking] = await Promise.all([
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
    const stakedDev = utils.formatUnits(staking.estimatedDev).toString()
    const estimatedEarningsDev = whenDefinedAll(
      [devApy, stakedDev],
      ([apy, stake]) => new BigNumber(stake).times(apy).toNumber()
    )
    const [estimatedEarningsUsd, usersDepositUsd] = await Promise.all([
      whenDefined(estimatedEarningsDev, usdByDev),
      whenDefined(stakedDev, (stake) => usdByDev(Number(stake))),
    ])
    estimatedEarnings = {
      dev: whenDefined(
        estimatedEarningsDev,
        (v) => toDp2(v).toString().split('.').map(Number) as [number, number]
      ),
      usd: whenDefined(
        estimatedEarningsUsd,
        (v) => toDp2(v).toString().split('.').map(Number) as [number, number]
      ),
    }
    usersDeposit = {
      dev: whenDefined(
        stakedDev,
        (v) => toDp2(v).toString().split('.').map(Number) as [number, number]
      ),
      usd: whenDefined(
        usersDepositUsd,
        (v) => toDp2(v).toString().split('.').map(Number) as [number, number]
      ),
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

  const fetchPositionsOfProperty = async () => {
    loading = true
    // const modalProvider = GetModalProvider()
    // const { provider } = await ReConnectWallet(modalProvider)

    if (!provider || !propertyAddress) {
      loading = false
      return
    }

    const [l1, l2] = await clientsSTokens(provider)

    const contract = l1 ?? l2
    const positions = await contract?.positionsOfProperty(propertyAddress)
    if (!positions) {
      loading = false
      return
    }

    for (const position of positions) {
      const positionPayload = await contract?.payloadOf(position)

      if (!membershipExists && positionPayload) {
        membershipExists = true
        break
      }
    }

    loading = false
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

  <form
    on:change|preventDefault={(_) => update()}
    class={`grid gap-16 ${loading ? 'animate-pulse' : ''} ${
      membershipExists ? 'opacity-30' : ''
    }`}
  >
    <div class="grid gap-16 lg:grid-cols-[3fr_2fr]">
      <!-- Form -->
      <div class="grid gap-8">
        <!-- Name -->
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Name </span>
          <input
            class="hs-form-field__input"
            bind:value={membership.name}
            on:change={onChangeName}
            id="membership-name"
            name="membership-name"
            disabled={membershipExists}
          />
        </label>

        <!-- Image -->
        <div class="flex flex-col gap-1">
          <label class="hs-form-field" for="avatarPath">
            <span class="hs-form-field__label">Image</span>

            {#if membership.imageSrc && membership.imageSrc != ''}
              <img
                src={membership.imageSrc}
                class="h-auto max-w-full cursor-pointer rounded"
                alt="Hero"
              />
            {/if}
            <span
              class="hs-button is-filled cursor-pointer rounded-lg bg-[#040B10] px-12 py-4"
              type="button">Choose Image</span
            >
            <input
              id="avatarPath"
              name="avatarPath"
              style="display:none"
              type="file"
              on:change={onFileSelected}
              disabled={membershipExists}
            />
          </label>
        </div>

        <!-- Price -->
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Price </span>
          <input
            class="hs-form-field__input"
            bind:value={membership.price}
            on:change={onChangePrice}
            id="membership-price"
            name="membership-price"
            type="number"
            disabled={membershipExists}
          />
        </label>

        <!-- Subscription Streaming -->
        <div class="rounded-lg border-[3px] border-blue-500 px-4 py-6">
          <h3 class="mb-8 font-title font-bold">Subscription Streaming</h3>

          <div class="grid gap-2">
            <p class="text-sm">Estimated Earnings/year (per 1 membership):</p>
            {#if !estimatedEarnings.usd || !estimatedEarnings.dev}
              <p
                class="h-[2rem] w-full animate-pulse cursor-progress rounded bg-gray-500/60"
              />
            {:else}
              <p>
                <span class="font-bold">{estimatedEarnings.usd[0]}</span>.<span
                  class="text-sm">{estimatedEarnings.usd[1]}</span
                >
                USD
                <span class="font-bold">{estimatedEarnings.dev[0]}</span>.<span
                  class="text-sm">{estimatedEarnings.dev[1]}</span
                >
                DEV
              </p>
            {/if}
            <p class="text-sm">User will earn (when unsubscribed):</p>
            {#if !usersDeposit.usd || !usersDeposit.dev}
              <p
                class="h-[2rem] w-full animate-pulse cursor-progress rounded bg-gray-500/60"
              />
            {:else}
              <p>
                <span class="font-bold">{usersDeposit.usd[0]}</span>.<span
                  class="text-sm">{usersDeposit.usd[1]}</span
                >
                USD
                <span class="font-bold">{usersDeposit.dev[0]}</span>.<span
                  class="text-sm">{usersDeposit.dev[1]}</span
                >
                DEV
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
    <label class="hs-form-field is-filled is-requred">
      <span class="hs-form-field__label"> Description </span>
      <textarea
        class="hs-form-field__input"
        bind:value={membership.description}
        id="membership-description"
        name="membership-description"
        disabled={membershipExists}
      />
      <p class="text-sm">Markdown is available</p>
    </label>

    <div class="flex w-full justify-end">
      <button type="button" on:click|preventDefault={() => cancel()}
        >Cancel</button
      >
    </div>
  </form>
</div>
