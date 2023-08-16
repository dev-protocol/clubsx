<script lang="ts">
  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import MembershipOptionCard from './MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import type { Membership } from '@plugins/memberships/index'
  import { parseUnits, keccak256, JsonRpcProvider, ZeroAddress, type Signer } from 'ethers'
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import { buildConfig, controlModal } from '@devprotocol/clubs-core/events'
  import { callSimpleCollections } from '@plugins/memberships/utils/simpleCollections'
  import type { Image } from '@plugins/memberships/utils/types/setImageArg'
  import MembershipOption from './MembershipOption.svelte'
  import InstantMembershipsPaymentType from '@assets/Instant-Memberships-Payment-Type.svg'
  import StakeMembershipsPaymentType from '@assets/Stake-Memberships-Payment-Type.svg'

  export let useOnFinishCallback: boolean = false
  export let currentPluginIndex: number
  export let membership: Membership
  export let existingMemberships: Membership[]
  export let base: string = '/admin'
  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined
  export let clubName: string | undefined = undefined
  const metaOfPayload = keccak256(membership.payload)

  type MembershipPaymentType = 'instant' | 'stake' | 'custom'

  let membershipPaymentType: MembershipPaymentType = 'instant'
  let updatingMembershipsStatus: boolean = false
  let noOfPositions: number = 0
  let invalidPriceMsg: string = ''

  const originalId = membership.id
  const provider = new JsonRpcProvider(rpcUrl)
  let membershipExists = false
  let loading = false

  let connection: typeof Connection
  let signer: Signer | undefined
  let currentAddress: string | undefined

  const minPrice = 0.000001
  const maxPrice = 1e20

  const deleteMembership = (selectedMembership: Membership) => {
    updatingMembershipsStatus = true

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
    updatingMembershipsStatus = true

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

  const changeMembershipPaymentType = async (type: MembershipPaymentType) => {
    membershipPaymentType = type
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
    const newMemberships = existingMemberships.some(({ id }) => id === search)
      ? // If the ID is already exists, override it. This is a safeguard to avoid duplicate data.
        existingMemberships.map((_mem) =>
          _mem.id === search ? membership : _mem
        )
      : // If not, add it.
        [...existingMemberships, membership]

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

  const onChangePrice = async () => {
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
      return
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
    // Redirect to base page
    window.location.href = base
  }

  const fetchPositionsOfProperty = async () => {
    loading = true

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
            ? new Uint8Array(Object.values(membership.payload)) // then we use only values
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

  const onFinishCallback = async (ev: any) => {
    updatingMembershipsStatus = false

    if (!ev.detail.success) {
      return
    }

    const memOpts = existingMemberships as Membership[]
    const propAddress = propertyAddress

    if (!currentAddress || !signer || !propAddress) {
      return
    }

    const images: Image[] = memOpts.map((opt) => ({
      src: opt.imageSrc,
      name: opt.name,
      description: opt.description,
      requiredETHAmount: parseUnits(String(opt.price)).toString(),
      requiredETHFee: opt.fee?.percentage
        ? parseUnits(
              new BigNumber(opt.price).times(opt.fee.percentage).toFixed()
            )
            .toString()
        : 0,
      gateway: opt.fee?.beneficiary ?? ZeroAddress,
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
    ]).then((res) => res.wait())

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
            class={`bg-dp-blue-grey-400 mt-2 w-fit rounded p-4 text-center text-sm font-semibold text-white ${
              updatingMembershipsStatus ? 'animate-pulse bg-gray-500/60' : ''
            }`}
            id={`delete-opt`}
            on:click|preventDefault={() => deleteMembership(membership)}
            >Delete</button
          >
        {/if}
        <br />
        {#if membership.deprecated}
          <button
            class={`bg-dp-blue-grey-400 mt-2 w-fit rounded p-4 text-center text-sm font-semibold text-white ${
              updatingMembershipsStatus ? 'animate-pulse bg-gray-500/60' : ''
            }`}
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
            class="hs-button is-filled w-fit cursor-pointer rounded-lg px-12 py-4"
          >
            <span class="hs-button__label">Upload to change image</span>
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
          <p class="hs-form-field__helper mt-2">
            * JPEG, PNG, GIF, TIFF and animated PNG
          </p>
          <span class="hs-form-field__helper"
            >* Recommended image size is 600 x 600 px</span
          >

          <p>
            <a
              href="https://docs.google.com/presentation/d/1bbQhOktQoaA5ynQB1RgvOc4eMWlMHFDliw1DmS35w8Y/edit?usp=sharing"
              target="_blank"
              class="hs-button is-filled is-small mt-8 w-fit"
              rel="noopener noreferrer"
            >
              <span class="hs-button__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
              </span>
              <span class="hs-button__label"> Use Google Slides template </span>
            </a>
          </p>
        </div>

        <!-- Price -->
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Price </span>
          <div class="flex justify-start items-center w-full max-w-full gap-1">
            <input
              class="hs-form-field__input grow"
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
            <select
              bind:value={membership.currency}
              name="membership-currency"
              class="hs-form-field__input w-fit"
              id="membership-currency"
              disabled={membershipExists}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="DEV">DEV</option>
            </select>
          </div>
          <p class="hs-form-field__helper mt-2">
            * If you choose USDC, you can active <u>the credit card payment plugin.</u>
          </p>
          {#if invalidPriceMsg !== ''}
            <p class="text-danger-300">* {invalidPriceMsg}</p>
          {/if}
        </label>

        <!-- Payment type -->
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Payment type </span>
          <div class="flex justify-start items-center gap-2 w-full max-w-full">
            <button
              on:click|preventDefault={() => changeMembershipPaymentType('instant')}
              class="hs-form-field__input grow max-w-[33%] flex gap-2 justify-center itmes-center"
              id="membership-fee"
            >
              <img src={InstantMembershipsPaymentType} alt="Instant Memberships" class="h-auto w-auto" />
              Instant
            </button>
            <button
              on:click|preventDefault={() => changeMembershipPaymentType('stake')}
              class="hs-form-field__input grow max-w-[33%] flex gap-2 justify-center itmes-center"
              id="membership-fee"
            >
              <img src={StakeMembershipsPaymentType} alt="Stake Memberships" class="h-auto w-auto " />
              Stake
            </button>
            <div class="grow max-w-[33%]">
              {#if  membershipPaymentType !== 'custom'}
                <button
                  on:click|preventDefault={() => changeMembershipPaymentType('custom')}
                  class="hs-form-field__input w-full max-w-full"
                  id="membership-fee"
                >Custom</button>
              {/if}
              {#if  membershipPaymentType === 'custom'}
                <input
                  class="hs-form-field__input w-full max-w-full"
                  id="membership-fee-value"
                  name="membership-fee-value"
                  type="number"
                  disabled={membershipExists}
                  min={minPrice}
                  max={maxPrice}
                />
              {/if}
            </div>
          </div>
        </label>

        <!-- Earning info -->
        <div class="hs-form-field">
          <div class="flex gap-0 w-full max-w-full p-0">
            <div class="h-6 rounded-[99px] w-[90%] bg-[#00D0FD]"></div>
            <div class="h-6 rounded-[99px] w-[10%] bg-[#43C451]"></div>
          </div>
          <p class="mt-1">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
          </p>
          <p class="hs-form-field__helper mt-2">
            * <u>What is staking?</u>
          </p>
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
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label"> Description </span>
      <textarea
        class="hs-form-field__input"
        bind:value={membership.description}
        id="membership-description"
        name="membership-description"
        disabled={membershipExists}
      />
      <span class="hs-form-field__helper">
        Markdown is available <a
          href="https://www.markdownguide.org/basic-syntax"
          target="_blank"
          class="underline [font-size:inherit]"
          rel="noopener noreferrer">(What is Markdown? ↗)</a
        >
      </span>
    </label>
    <a
      href="https://openai.com/"
      target="_blank"
      class="hs-button is-filled is-small w-fit"
      rel="noopener noreferrer"
    >
      <span class="hs-button__label"> Need help? Try asking an AI </span>
    </a>

    <!-- Display payload as string -->
    <label class="hs-form-field">
      <span class="hs-form-field__label"> Payload </span>
      <input class="hs-form-field__input" value={metaOfPayload} readonly />
    </label>

    <div class="flex w-full justify-end gap-[20px]">
      {#if mode === 'edit' && !membership.deprecated}
        <button
          class={`hs-button is-filled is-error w-fit ${
            updatingMembershipsStatus ? 'animate-pulse bg-gray-500/60' : ''
          }`}
          type="button"
          on:click|preventDefault={() => deleteMembership(membership)}
        >
          <span class="hs-button__label"> Delete </span>
        </button>
      {/if}
      {#if mode === 'edit' && membership.deprecated}
        <button
          class={`hs-button is-filled w-fit ${
            updatingMembershipsStatus ? 'animate-pulse bg-gray-500/60' : ''
          }`}
          type="button"
          on:click|preventDefault={() => activateMembership(membership)}
        >
          <span class="hs-button__label"> Activate </span>
        </button>
      {/if}
      <button
        class="hs-button is-outlined is-error"
        type="button"
        on:click|preventDefault={() => cancel()}
      >
        <span class="hs-button__label">Cancel</span>
      </button>
    </div>
  </form>
</div>
