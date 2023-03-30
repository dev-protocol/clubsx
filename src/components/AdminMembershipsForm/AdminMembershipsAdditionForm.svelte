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
  import {
    buildConfig,
    controlModal,
    onMountClient,
  } from '@devprotocol/clubs-core/events'
  import { callSimpleCollections } from '@plugins/memberships/utils/simpleCollections'
  import type { Image } from '@plugins/memberships/utils/types/setImageArg'

  export let useOnFinishCallback: boolean = false
  export let currentPluginIndex: number
  export let membership: Membership
  export let existingMemberships: Membership[]
  export let base: string = '/admin'
  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined
  export let clubName: string | undefined = undefined

  let noOfPositions: number = 0

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

  const deleteMembership = (selectedMembership: Membership) => {
    const membership = existingMemberships.find(
      (m: Membership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...existingMemberships.filter(
              (m: Membership) => m.id !== selectedMembership.id
            ),
            { ...membership, deprecated: true },
          ],
        },
      ],
      currentPluginIndex
    )

    setTimeout(buildConfig, 50)
  }

  const activateMembership = (selectedMembership: Membership) => {
    const membership = existingMemberships.find(
      (m: Membership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'memberships',
          value: [
            ...existingMemberships.filter(
              (m: Membership) => m.id !== selectedMembership.id
            ),
            { ...membership, deprecated: false },
          ],
        },
      ],
      currentPluginIndex
    )

    setTimeout(buildConfig, 50)
  }

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

    membership.imageSrc =
      (await uploadImageAndGetPath(file)) || `https://i.imgur.com/sznqcmL.png`

    membership = membership

    update()
  }

  const onChangeName = () => {
    let id = membership.name.toLowerCase().replace(/\W/g, '-')
    // Duplication detection
    let count = 1
    let _id = id
    while (existingMemberships.some((x) => x.id === id)) {
      count = count + 1
      id = `${_id}-${count}`
    }

    membership.id = id
  }

  const toDp2 = (v: number | string) =>
    new BigNumber(v).dp(2).toNumber().toLocaleString('en-US', {
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
    // Redirect to base page
    window.location.href = base
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
    noOfPositions = positions?.length || 0

    if (!positions || !positions?.length) {
      loading = false
      return
    }

    for (const position of positions) {
      const positionPayload = await contract?.payloadOf(position)

      if (
        keccak256(
          typeof membership.payload === typeof {} // If membership.payload is an object
            ? Object.values(membership.payload) // then we use only values
            : membership.payload // else we use the array directly
        ) === positionPayload &&
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
    const propAddress = propertyAddress

    if (!currentAddress || !signer || !propAddress) {
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

<div class="relative grid gap-16">
  <!-- Form no editable message -->
  {#if noOfPositions && membershipExists}
    <div
      class={`absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm`}
    >
      <p
        class="absolute top-[50%] h-full max-h-full w-full max-w-full text-center font-bold text-white"
      >
        This membership cannot be edited since it already has {noOfPositions} members.
        <br />
        {#if !membership.deprecated}
          <button
            class={`mt-2 w-fit rounded bg-dp-blue-grey-400 p-4 text-center text-sm font-semibold text-white`}
            id={`delete-opt`}
            on:click|preventDefault={() => deleteMembership(membership)}
            >Delete</button
          >
        {/if}
        <br />
        {#if membership.deprecated}
          <button
            class={`mt-2 w-fit rounded bg-dp-blue-grey-400 p-4 text-center text-sm font-semibold text-white`}
            id={`activate-opt`}
            on:click|preventDefault={() => activateMembership(membership)}
            >Activate</button
          >
        {/if}
      </p>
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
        <div class="hs-form-field">
          <span class="hs-form-field__label">Image</span>
          <label
            class="hs-button is-filled w-fit cursor-pointer rounded-lg bg-[#040B10] px-12 py-4"
            >Upload to change image
            <input
              id="avatarPath"
              name="avatarPath"
              style="display:none"
              type="file"
              accept=".jpg, .jpeg, .png, .gif, .apng, .tiff"
              on:change={onFileSelected}
              disabled={membershipExists}
            />
          </label>
          <p class="text-xs opacity-60">
            * JPEG, PNG, GIF, TIFF and animated PNG
          </p>

          <span class="mt-1 text-xs opacity-60"
            >* Recommended image size is 600 x 600 px</span
          >

          <p>
            <a
              href="https://docs.google.com/presentation/d/1bbQhOktQoaA5ynQB1RgvOc4eMWlMHFDliw1DmS35w8Y/edit?usp=sharing"
              target="_blank"
              class="hs-button is-filled mt-8 w-fit border-0 bg-dp-blue-grey-400"
              rel="noopener noreferrer"
              >Use Google Slides template <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="ml-2 h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </a>
          </p>
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
            clubName={clubName ?? 'Your Club'}
            id={membership.id}
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
      <p class="mb-6 text-sm">
        Markdown is available <a
          href="https://www.markdownguide.org/basic-syntax"
          target="_blank"
          class="text-sm underline"
          rel="noopener noreferrer">(What is Markdown? ↗)</a
        >
      </p>
      <p>
        <a
          href="https://openai.com/"
          target="_blank"
          class="hs-button is-filled w-fit border-0 bg-dp-blue-grey-400 text-sm"
          rel="noopener noreferrer"
          >Try asking AI about "membership ideas for gaming community"</a
        >
      </p>
    </label>

    <div class="flex w-full justify-end gap-[20px]">
      {#if mode === 'edit' && !membership.deprecated}
        <button
          class="hs-button is-filled w-fit bg-dp-blue-grey-400"
          type="button"
          on:click|preventDefault={() => deleteMembership(membership)}
          >Delete</button
        >
      {/if}
      {#if mode === 'edit' && membership.deprecated}
        <button
          class="hs-button is-filled w-fit bg-dp-blue-grey-400"
          type="button"
          on:click|preventDefault={() => activateMembership(membership)}
          >Activate</button
        >
      {/if}
      <button type="button" on:click|preventDefault={() => cancel()}
        >Cancel</button
      >
    </div>
  </form>
</div>
