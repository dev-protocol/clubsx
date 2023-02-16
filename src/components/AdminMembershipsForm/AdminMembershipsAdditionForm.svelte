<script lang="ts">
  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { Membership } from '@plugins/memberships/index'
  import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { ethers, providers, utils } from 'ethers'
  import {
    positionsCreateWithEth,
    estimationsAPY,
  } from '@devprotocol/dev-kit/agent'
  import { usdByDev } from '@fixtures/coingecko/api'
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { keccak256 } from 'ethers/lib/utils'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import { controlModal, onMountClient } from '@devprotocol/clubs-core/events'
  import { callSimpleCollections } from '@plugins/memberships/utils/simpleCollections'
  import type { Image } from '@plugins/memberships/utils/types/setImageArg'

  export let useOnFinishCallback: boolean = false
  export let currentPluginIndex: number
  export let presets: UndefinedOr<Membership[]> = undefined
  export let membership: Membership
  export let existingMemberships: Membership[]
  export let base: string = '/admin'
  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined

  let invalidPriceMsg: string = ''

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
  let subscriptionStreamingLoading = true

  let connection: typeof Connection
  let signer: ethers.Signer | undefined
  let currentAddress: string | undefined

  const minPrice = 0.000001
  const maxPrice = 1e20

  const connectOnMount = async () => {
    const _connection = await import('@devprotocol/clubs-core/connection')
    connection = _connection.connection
    connection().signer.subscribe((s) => {
      signer = s
    })
    connection().account.subscribe((a) => {
      currentAddress = a
    })
  }

  onMount(() => {
    onChangePrice()
    fetchPositionsOfProperty()
    update()
    connectOnMount()

    if (useOnFinishCallback) {
      document.body.addEventListener(
        ClubsEvents.FinishConfiguration,
        onFinishCallback
      )
    }
  })

  const validateMembershipPrice = (event: Event) => {
    const value = Number((event.target as HTMLInputElement)?.value || 0)

    if (value < minPrice) {
      invalidPriceMsg = `Minimum price allowed is ${minPrice}`
    } else if (value > maxPrice) {
      invalidPriceMsg = `Maximum price allowed is ${maxPrice.toExponential(3)}`
    } else {
      invalidPriceMsg = ''
    }
  }

  const update = () => {
    if (membership.price < minPrice || membership.price > maxPrice) return

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

  const toDp2 = (v: number | string) =>
    new BigNumber(v)
      .dp(2)
      .toNumber()
      .toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 3,
        useGrouping: false,
      })

  const onChangePrice = async () => {
    subscriptionStreamingLoading = true

    const value = membership.price

    if (value < minPrice) {
      membership.price = minPrice
      invalidPriceMsg = `Price automatically set to minimum allowed value- ${minPrice}`
    } else if (value > maxPrice) {
      membership.price = maxPrice
      invalidPriceMsg = `Price automatically set to maximum allowed value- ${maxPrice.toExponential(
        3
      )}`
    } else {
      invalidPriceMsg = ''
    }

    if (membership.price === 0 || !membership.price) {
      estimatedEarnings = { dev: [0, 0], usd: [0, 0] }
      usersDeposit = { dev: [0, 0], usd: [0, 0] }
      subscriptionStreamingLoading = false
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
        ethAmount:
          utils.parseEther(membership.price?.toString() || '0')?.toString() ||
          '0',
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

    subscriptionStreamingLoading = false
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

      if (
        keccak256(membership.payload) === positionPayload &&
        !membershipExists
      ) {
        membershipExists = true
        break
      }
    }

    loading = false
  }

  const onFinishCallback = async () => {
    const memOpts = existingMemberships as Membership[]
    const propAddress = propertyAddress as string

    if (!currentAddress || !signer) {
      return
    }

    const images: Image[] = memOpts.map((opt) => ({
      src: opt.imageSrc,
      name: opt.name,
      description: opt.description,
      requiredETHAmount: ethers.utils.parseUnits(String(opt.price)).toString(),
      requiredETHFee: opt.fee?.percentage
        ? ethers.utils
            .parseUnits(
              new BigNumber(opt.price).times(opt.fee.percentage).toFixed()
            )
            .toString()
        : 0,
      gateway: opt.fee?.beneficiary ?? ethers.constants.AddressZero,
    }))

    const keys: string[] =
      memOpts?.map((opt) => keccak256(new Uint8Array(opt.payload))) || []

    console.log({ keys, images, propAddress })

    controlModal({
      open: true,
      state: 'loading',
      blocks: true,
      closeButton: { label: 'Cancel' },
    })

    await callSimpleCollections(signer, 'setImages', [
      propAddress,
      images,
      keys,
    ]).then((res: ethers.providers.TransactionResponse) => res.wait())

    controlModal({ open: false })
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
              >Choose Image</span
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
            on:keyup={validateMembershipPrice}
            id="membership-price"
            name="membership-price"
            type="number"
            disabled={membershipExists}
            min={minPrice}
            max={maxPrice}
          />
          {#if invalidPriceMsg !== ''}
            <p class="text-danger-300">* {invalidPriceMsg}</p>
          {/if}
        </label>

        <!-- Subscription Streaming -->
        <div class="rounded-lg border-[3px] border-blue-500 px-4 py-6">
          <h3 class="mb-8 font-title font-bold">Subscription Streaming</h3>

          <div class="grid gap-2">
            <p class="text-sm">Estimated Earnings/year (per 1 membership):</p>
            {#if !estimatedEarnings.usd || !estimatedEarnings.dev || subscriptionStreamingLoading}
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
            {#if !usersDeposit.usd || !usersDeposit.dev || subscriptionStreamingLoading}
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
            ethPrice={membership.price?.toString() || '0'}
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
