<script lang="ts">
  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import { buildConfig, controlModal } from '@devprotocol/clubs-core/events'
  import type { Collection, CollectionMembership } from '@plugins/collections'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import {
    DEV_TOKEN_PAYMENT_TYPE_FEE,
    PAYMENT_TYPE_INSTANT_FEE,
    PAYMENT_TYPE_STAKE_FEE,
  } from '@constants/memberships'
  
  import { formatUnixTimestamp } from '@plugins/collections/fixtures'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import { address, callSlotCollections } from '@plugins/collections/utils/slotCollections'
  import type { Image } from '@plugins/collections/utils/types/setImageArg'
  import { randomBytes, parseUnits, keccak256, JsonRpcProvider, ZeroAddress, type Signer } from 'ethers'
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { tokenInfo } from '@constants/common'
  import { bytes32Hex } from '@fixtures/data/hexlify'

  
  export let existingCollections: Collection[] = []
  export let collection: Collection
  export let isTimeLimitedCollection: boolean = false
  export let clubName: string | undefined = undefined
  export let isAdding: boolean = false
  export let useOnFinishCallback: boolean = false
  export let currentPluginIndex: number

  export let mode: 'edit' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined

  let connection: typeof Connection
  let signer: Signer | undefined
  let currentAddress: string | undefined

  type MembershipPaymentType = 'instant' | 'stake' | 'custom' | ''
  // note: treat this variable as state variable which stores the state for memberships edits and also for storing in DB
  export let membership: CollectionMembership = {
    id: '',
    name: 'My First Membership',
    description: '',
    price: 0,
    currency: 'USDC',
    imageSrc: '',
    paymentType: 'instant',
    fee: {
      percentage: PAYMENT_TYPE_INSTANT_FEE,
      beneficiary: ZeroAddress,
    },
    payload: randomBytes(8),
  }

  let membershipPaymentType: MembershipPaymentType =
    membership.paymentType ?? (membership.currency === 'DEV' ? 'custom' : '')
  let membershipCustomFee100: number = membership.fee
    ? membership.fee.percentage * 100
    : membership.currency === 'DEV'
    ? DEV_TOKEN_PAYMENT_TYPE_FEE * 100
    : 0
  let updatingMembershipsStatus: boolean = false
  let noOfPositions: number = 0
  let invalidPriceMsg: string = ''
  let invalidFeeMsg: string = ''
  let invalidStartTimeMsg: string = ''
  let invalidEndTimeMsg: string = ''

  const originalId = collection.id
  const provider = new JsonRpcProvider(rpcUrl)

  let membershipExists = false
  let loading = false

  const minPrice = 0.000001
  const maxPrice = 1e20
  const minCustomFee100 = 0
  const maxCustomFee100 = 95

  const onChangeName = () => {
    let id = membership.name.toLowerCase().replace(/\W/g, '-')
    // Duplication detection
    let count = 1
    let _id = id
    while (collection.memberships.some((x) => x.id === id)) {
      count = count + 1
      id = `${_id}-${count}`
    }

    membership.id = id
    updateState()
  }

  const onCollectionChangeName = () => {
    let id = collection.name.toLowerCase().replace(/\W/g, '-')
    // Duplication detection
    let count = 1
    let _id = id
    while (existingCollections.some((x) => x.id === id)) {
      count = count + 1
      id = `${_id}-${count}`
    }

    collection.id = id
  }

  const onCollectionFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files || !collection) {
      return
    }

    const file = e.currentTarget.files[0]

    collection.imageSrc =
      (await uploadImageAndGetPath(file)) || `https://i.ibb.co/RbxFzn8/img.jpg`

    collection = collection

    update()
  }

  const onMembershipFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files || !membership) {
      return
    }

    const file = e.currentTarget.files[0]

    membership.imageSrc =
      (await uploadImageAndGetPath(file)) || `https://i.ibb.co/RbxFzn8/img.jpg`

    membership = membership

    updateState()
  }


  const deleteMembership = (selectedMembership: CollectionMembership) => {
    updatingMembershipsStatus = true

    const membership = collection.memberships.find(
      (m: CollectionMembership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'collections',
          value: [
            {
              ...collection,
              memberships: [
                ...collection.memberships.filter(
                  (m: CollectionMembership) => m.id !== selectedMembership.id
                ),
                { ...membership, deprecated: true },
              ],
            },
          ],
        },
      ],
      currentPluginIndex
    )

    setTimeout(buildConfig, 50)
  }

  const activateMembership = (
    selectedCollection: Collection,
    selectedMembership: CollectionMembership
  ) => {
    updatingMembershipsStatus = true

    const membership = selectedCollection.memberships.find(
      (m: CollectionMembership) =>
        m.id === selectedMembership.id &&
        m.name === selectedMembership.name &&
        JSON.stringify(m.payload) === JSON.stringify(selectedMembership.payload)
    )

    setOptions(
      [
        {
          key: 'collections',
          value: [
            ...existingCollections.filter(
              (c: Collection) => c.id !== selectedCollection.id
            ),
            {
              ...selectedCollection,
              memberships: [
                ...selectedCollection.memberships.filter(
                  (m: CollectionMembership) => m.id !== selectedMembership.id
                ),
                { ...membership, deprecated: false },
              ],
            },
          ],
        },
      ],
      currentPluginIndex
    )
    setTimeout(buildConfig, 50)
  }

  let formattedStartTime = formatUnixTimestamp(
    collection.startTime || new Date().getTime() / 1000
  )
  let formattedEndTime = formatUnixTimestamp(
    collection.endTime || new Date().getTime() / 1000 + 120
  )

  const onStartTimeChange = (event: Event) => {
    // need to prevent a change if there are already members
    const value = (event.target as HTMLInputElement)?.value || 0
    const passedUnixTime = new Date(value).getTime() / 1000
    const currentTime = Date.now() / 1000
    if (passedUnixTime < Date.now() / 1000) {
      collection = {
        ...collection,
        startTime: currentTime,
      }
      formattedStartTime = formatUnixTimestamp(currentTime)
      invalidStartTimeMsg = 'Invalid start time: Minimum allowed is now.'
    } else {
      collection = {
        ...collection,
        startTime: passedUnixTime,
      }
      formattedStartTime = formatUnixTimestamp(passedUnixTime)
      invalidStartTimeMsg = ''
    }
    collection = collection
  }

  const onEndTimeChange = async (event: Event) => {
    const value = (event.target as HTMLInputElement)?.value || 0
    const passedUnixTime = new Date(value).getTime() / 1000
    const currentTime = Date.now() / 1000
    if (passedUnixTime <= currentTime) {
      const twoMinutes = 120
      collection = {
        ...collection,
        startTime: collection?.startTime || currentTime,
        endTime: currentTime + twoMinutes,
      }
      formattedEndTime = formatUnixTimestamp(currentTime + twoMinutes)
      invalidEndTimeMsg =
        'Invalid end time: Minimum allowed is 2 minutes from now.'
    } else {
      invalidEndTimeMsg = ''
      collection = {
        ...collection,
        startTime: collection.startTime || currentTime,
        endTime: passedUnixTime,
      }
      formattedEndTime = formatUnixTimestamp(passedUnixTime)
    }
  }

  const onChangeMemberCount = async (selectedMembership :CollectionMembership) => {
    const value = selectedMembership.memberCount ?? 0

    if (value < 1) {
      selectedMembership.memberCount = 1
      // Safe range: Maximum permitted value is 4294967295
    } else if (value > 999999999) {
      selectedMembership.memberCount = 999999999
    } else {
      invalidPriceMsg = ''
    }
    if (selectedMembership.memberCount === 0 || !selectedMembership.memberCount) {
      return
    }
    collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }
    membership = selectedMembership
  }

  const onChangeCustomFee = async (selectedMembership: CollectionMembership) => {
    if (selectedMembership.currency === 'DEV') {
      // Update the membership fee in case of currency change to dev token.
      membershipPaymentType = 'custom'
      membershipCustomFee100 = 0
      invalidFeeMsg = ''
      selectedMembership = {
        ...membership,
        fee: {
          beneficiary: currentAddress ?? ZeroAddress,
          percentage: DEV_TOKEN_PAYMENT_TYPE_FEE,
        },
        paymentType: 'custom'
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }
      membership = selectedMembership
      // Trigger update manually as this corresponsing field doesn't trigger <form> on change event.
      update()
      return
    }

    const value = membershipCustomFee100

    if (value < minCustomFee100) {
      membershipCustomFee100 = minCustomFee100
      invalidFeeMsg = `Fee automatically set to minimum allowed value- ${minCustomFee100}`
    } else if (value > maxCustomFee100) {
      membershipCustomFee100 = maxCustomFee100
      invalidFeeMsg = `Fee automatically set to maximum allowed value- ${maxCustomFee100}`
    } else {
      invalidFeeMsg = ''
    }

    // Update the membership state.
    selectedMembership = {
      ...membership,
      fee: {
          percentage: membershipCustomFee100 / 100,
          beneficiary: currentAddress ?? ZeroAddress,
        },
      paymentType: 'custom'
    }
    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== selectedMembership.id
        ),
        {
          ...selectedMembership
        },
      ],
    }
    membership = selectedMembership

    // Trigger update manually as this corresponsing field doesn't trigger <form> on change event.
    update()

    if (membershipCustomFee100 === 0 || !membershipCustomFee100) {
      return
    }
  }

  const validateCustomMembershipFee = (event: Event) => {
    const value = Number((event.target as HTMLInputElement)?.value || 0)

    if (value < minCustomFee100) {
      invalidFeeMsg = `Minimum payment type fee allowed is ${minCustomFee100}`
    } else if (value > maxCustomFee100) {
      invalidFeeMsg = `Maximum price allowed is ${maxCustomFee100}`
    } else {
      invalidFeeMsg = ''
    }
  }

  const changeMembershipPaymentType = async (
    selectedMembership: CollectionMembership,
    type: MembershipPaymentType
  ) => {
    if (selectedMembership.currency === 'DEV') {
      // Update the membership fee in case of currency change to dev token.
      membershipPaymentType = 'custom'
      membershipCustomFee100 = 0
      selectedMembership = {
        ...membership,
        fee: {
          percentage: DEV_TOKEN_PAYMENT_TYPE_FEE,
          beneficiary: currentAddress ?? ZeroAddress,
        },
        paymentType: 'custom'
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }

      membership = selectedMembership
      update() // Trigger update manually as this corresponsing field doesn't trigger <form> on change event.
      return
    }

    if (type === 'instant') {
      // Update the membership state directly
      selectedMembership = {
        ...membership,
        fee: {
          percentage: PAYMENT_TYPE_INSTANT_FEE,
          beneficiary: currentAddress ?? ZeroAddress,
        },
        paymentType: 'instant'
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }
      membership = selectedMembership
    }

    if (type === 'stake') {
      // Update the membership state directly
      selectedMembership = {
        ...membership,
        fee: {
          percentage: PAYMENT_TYPE_STAKE_FEE,
          beneficiary: currentAddress ?? ZeroAddress,
        },
        paymentType: 'stake'
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }
      membership = selectedMembership
    }

    if (type === 'custom') {
      selectedMembership = {
        ...membership,
        fee: {
          percentage: membershipCustomFee100 / 100,
          beneficiary: currentAddress ?? ZeroAddress,
        },
        paymentType: 'custom'
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id
          ),
          {
            ...selectedMembership
          },
        ],
      }
      membership = selectedMembership
    }

    membershipPaymentType = type
    update() // Trigger update manually as this corresponsing field doesn't trigger <form> on change event.
  }

  const onChangePrice = async (selectedMembership: CollectionMembership) => {
    const value = selectedMembership.price

    if (value < minPrice) {
      selectedMembership.price = minPrice
      invalidPriceMsg = `Price automatically set to minimum allowed value- ${minPrice}`
    } else if (value > maxPrice) {
      selectedMembership.price = maxPrice
      invalidPriceMsg = `Price automatically set to maximum allowed value- ${maxPrice.toExponential(
        3
      )}`
    } else {
      invalidPriceMsg = ''
    }

    if (selectedMembership.price === 0 || !selectedMembership.price) {
      return
    }
    updateState()
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
    onChangePrice(membership)
    fetchPositionsOfProperty()
    update()
    onStartTimeChange
    onEndTimeChange
    connectOnMount()

    if (useOnFinishCallback) {
      document.body.addEventListener(
        ClubsEvents.FinishConfiguration,
        onFinishCallback,
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

  const resetMembershipFee = (selectedMembership: CollectionMembership) => {
    if (selectedMembership.currency !== 'DEV') return

    membershipCustomFee100 = 0
    membershipPaymentType = 'custom'
    invalidFeeMsg = ''
    // Update the membership state.
    selectedMembership = {
      ...membership,
      fee: {
        percentage: membershipCustomFee100,
          beneficiary: currentAddress ?? ZeroAddress,
        },
      paymentType: 'custom'
    }
    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== selectedMembership.id
        ),
        {
          ...selectedMembership
        },
      ],
    }
    membership = selectedMembership
  }

  const setIsAdding = (value: boolean) => {
    isAdding = value
  }

  const updateState = () => {
    if (
      membership.price < minPrice ||
      membership.price > maxPrice ||
      membershipPaymentType === ''
    )
      return

    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== membership.id
        ),
        membership,
      ],
    }
  }

  const update = () => {
    const newCollections = [
      ...existingCollections.filter((c: Collection) => c.id !== collection.id),
      collection,
    ]
    setOptions(
      [{ key: 'collections', value: newCollections }],
      currentPluginIndex
    )
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
        bytes32Hex(
          typeof membership.payload === typeof {} // If membership.payload is an object
            ? new Uint8Array(Object.values(membership.payload)) // then we use only values
            : membership.payload, // else we use the array/string directly
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
    const memOpts = collection.memberships as CollectionMembership[]
    const propAddress = propertyAddress

    if (!currentAddress || !signer || !propAddress) {
      return
    }
    const chainId: number = Number((await provider.getNetwork()).chainId)
    let images: Image[] = []
    if(isTimeLimitedCollection){
      images = memOpts.map((opt) => ({
      src: opt.imageSrc,
      name: opt.name,
      description: opt.description,
      deadline: collection.endTime,
      requiredTokenAmount: parseUnits(String(opt.price), tokenInfo[opt.currency][chainId].decimals).toString(),
      requiredTokenFee: opt.fee?.percentage
        ? parseUnits(
              new BigNumber(opt.price).times(opt.fee.percentage * 100).toFixed(),
              tokenInfo[opt.currency][chainId].decimals
            )
            .toString()
        : 0,
      gateway: opt.fee?.beneficiary ?? ZeroAddress,
      token: tokenInfo[opt.currency][chainId].address
    }))
    }
    else{
      images = memOpts.map((opt) => ({
      src: opt.imageSrc,
      name: opt.name,
      description: opt.description,
      slots: opt.memberCount,
      requiredTokenAmount: parseUnits(String(opt.price), tokenInfo[opt.currency][chainId].decimals).toString(),
      requiredTokenFee: opt.fee?.percentage
        ? parseUnits(
              new BigNumber(opt.price).times(opt.fee.percentage * 100).toFixed(),
              tokenInfo[opt.currency][chainId].decimals
            )
            .toString()
        : 0,
      gateway: opt.fee?.beneficiary ?? ZeroAddress,
      token: tokenInfo[opt.currency][chainId].address
    }))
    }
    const keys: string[] = memOpts?.map((opt) => bytes32Hex(opt.payload)) || []
    console.log('onFinishCallback', { images, keys })

    controlModal({
      open: true,
      state: 'loading',
      blocks: true,
      closeButton: { label: 'Cancel' },
    })
    await callSlotCollections(signer, "setImages", isTimeLimitedCollection,[
      propAddress,
      images,
      keys
    ]).then((res) => res.wait())
    
    const descriptiorAddress : string | undefined = isTimeLimitedCollection ?
    address.find(
      (address) => address.chainId === chainId,
    )?.addressList.timeSlot : address.find(
      (address) => address.chainId === chainId,
    )?.addressList.memberSlot
    if (!descriptiorAddress) return // TODO: add loading/processing state.

    const [l1, l2] = await clientsSTokens(signer)
    const l = l1 || l2
    if (!l) return // TODO: add loading/processing state.

    await l.setTokenURIDescriptor(
      propAddress,
      descriptiorAddress,
      keys, // ALL_PAYLOADS
    )

    controlModal({ open: false })
  }
</script>

<form on:change|preventDefault={() => update()} class="w-full">
  <div class="w-full max-w-full">
    <!-- collection name -->
    <div
      class="mb-16 flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
    >
    <div class="m-0 w-full items-center p-0">
      <span class="mr-[13px] font-body">Collection name </span>
      <span class="font-body text-[#EB48F8]"> * </span>
    </div>
      <label class="hs-form-field is-filled">
          <input
          bind:value={collection.name}
          on:change={onCollectionChangeName}
          class="hs-form-field__input"
          id="collection-name"
          name="collection-name"
        />
      </label>
    </div>
    <!-- collection cover image uploader-->
    <div class="mb-16 flex h-[294px] w-[479px] flex-col items-start gap-[7px]">
      <div class="flex items-start gap-[13px]">
        <span class="text-base font-normal text-white"
          >Collection cover image</span
        >
        <span class="text-base font-normal uppercase text-[#EB48F8]"> * </span>
      </div>
      <label class="cursor-pointer">
        <div class="flex flex-col items-start self-stretch rounded-[19px] border border-[#ffffff1a] bg-[#ffffff1a] p-2">
        {#if collection.imageSrc !== ''}
        <img
          class="object-cover h-[216px] w-[463px] rounded-[12px]"
          src={collection.imageSrc}
          alt={`${collection.name}-collection-cover-image`}
        />
        {:else}
        <div class="h-[216px] w-[463px] rounded-[12px] bg-[#040B10]" />
      {/if}
    </div>
        <input
          id="collection-cover-image"
          name="collection-cover-image"
          style="display:none"
          type="file"
          accept=".jpg, .jpeg, .png, .gif, .apng, .tiff"
          class="hs-button is-filled is-large cursor-pointer"
          on:change={onCollectionFileSelected}
        />
      </label>
      <span class="text-base font-normal leading-6 text-white"
        >Recommended image size is 2400 x 1200px</span
      >
    </div>

    <!-- start date -->
    <div class="mb-16 flex w-[479px] flex-col items-start gap-[7px]">
      <div class="flex items-start gap-[13px]">
        <span class="text-base font-normal text-white">Start date</span>
        <span class="text-base font-normal uppercase text-[#EB48F8]"> * </span>
      </div>
      <label class="hs-form-field is-filled">      
          <input
          bind:value={formattedStartTime}
          on:change={onStartTimeChange}
          type="datetime-local"
          class="hs-form-field__input"
          id="collectino-start-date"
          name="collection-start-date"
          min={formatUnixTimestamp(Date.now() / 1000)}
          max="2038-01-18T00:00"
        />
      </label>

      {#if invalidStartTimeMsg !== ''}
        <p class="text-danger-300">* {invalidStartTimeMsg}</p>
      {/if}
    </div>

    {#if isTimeLimitedCollection}
      <div class="mb-16 flex w-[479px] flex-col items-start gap-[7px]">
        <div class="flex items-start gap-[13px]">
          <span class="text-base font-normal text-white">End date</span>
          <span class="text-base font-normal uppercase text-[#EB48F8]">
            *
          </span>
        </div>
        <label class="hs-form-field is-filled">
          <input
            bind:value={formattedEndTime}
            on:change={onEndTimeChange}
            type="datetime-local"
            class="hs-form-field__input"
            id="collectino-start-date"
            name="collection-start-date"
            min={formatUnixTimestamp(Date.now() / 1000)}
            max="2038-01-18T00:00"
          />
        </label>
        {#if invalidEndTimeMsg !== ''}
          <p class="text-danger-300">* {invalidEndTimeMsg}</p>
        {/if}
      </div>
    {/if}

    <div
      class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[7px]"
    >
      <div class="items-center p-0">
        <span class="mr-[13px] font-body">Description</span>
        <span class="font-body text-[#EB48F8]"> * </span>
      </div>
      <label class="hs-form-field is-filled">
        <textarea
        class="hs-form-field__input"
        id="collection-description"
        name="collection-description"
        rows="3"
        bind:value={collection.description}
        />
      <p class="hs-form-field__helper">Markdown is available</p>
      </label>
    </div>

    <!-- Allowlist -->
    <div
      class="flex h-[682px] max-w-4xl flex-shrink-0 flex-col items-start gap-[7px]"
    >
      <span class="text-base font-normal">Allowlist</span>
      <span class="text-base font-normal"
        >Please set the people who can access this collection. Add new
        memberships from [here].</span
      >
      <div class="flex flex-col items-start self-stretch">
        <div
          class="flex items-start gap-[12px] self-stretch rounded-[12px] bg-[#040B10] p-5"
        >
          <div class="flex items-center">
            <input
              id="access"
              name="notification-method"
              type="radio"
              checked
              class="h-4 w-4 border-gray-300 text-[#3043EB] focus:ring-[#3043EB] dark:focus:ring-[#3043EB]"
            />
            <label
              for="access"
              class="ml-3 block text-justify text-base font-normal text-white"
              >Pubic access (Open to everyone)</label
            >
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 justify-between gap-4 pt-2.5">
        <MembershipOption
          clubName={'Your Club'}
          id={'1'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/hLD6byP/1.jpg'}
          currency={'USDC'}
          price={"100"}
          description={'Membership Description'}
          className={`lg:row-start-3 ${getColStart(0)}`}
        />
        <MembershipOption
          clubName={'Your Club'}
          id={'2'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/Kyjr50C/Image.png'}
          currency={'ETH'}
          price={"0.1"}
          description={'Membership Description'}
          className={`lg:row-start-3 ${getColStart(1)}`}
        />
        <MembershipOption
          clubName={'Your Club'}
          id={'3'}
          name={'Membership Name'}
          imagePath={'https://i.ibb.co/nrdKDQy/Image-1.png'}
          currency={'DEV'}
          price={"0.1"}
          description={'Membership Description'}
          className={`lg:row-start-3 ${getColStart(2)}`}
        />
      </div>
    </div>

    <!-- collection items -->
    {#if !isAdding}
      <h1 class="mb-16 font-title text-2xl font-bold">Collection Items</h1>
      <button
        type="button"
        class={`hs-button is-large is-filled mb-16 w-fit c px-8 py-6 text-base font-bold text-white`}
        on:click={() => setIsAdding(true)}
      >
        + Add
      </button>
    {/if}

    <!-- Register New Item -->
    <div class="w-full">
      {#if isAdding}
        <h1 class="mb-16 font-title text-2xl font-bold">Register New Item</h1>
        <div
          class="mb-16 flex w-[52.2%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Name </span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <label class="hs-form-field is-filled">
            <input
            bind:value={membership.name}
            on:change={onChangeName}
            class="hs-form-field__input"
            id="product-name"
            name="product-name"
            placeholder="Name of product"
          />
          </label>
        </div>
        <div
          class="mb-16 flex h-[207px] w-[186px] flex-col items-start gap-[7px]"
        >
          <div class="flex items-start gap-[13px]">
            <span class="text-base font-normal text-white">Image</span>
            <span class="text-base font-normal uppercase text-[#EB48F8]">
              *
            </span>
          </div>
          <label>
            <div
              class="flex flex-col items-start self-stretch rounded-[19px] border border-[#ffffff1a] bg-[#ffffff1a] p-2"
            >
            {#if membership.imageSrc !== ''}
              <img
                class="object-cover h-[160px] w-[170px] rounded-[12px]"
                src={membership.imageSrc}
                alt={`${membership.name}-membership-image`}
              />
              {:else}
              <div class="h-[160px] w-[170px] rounded-[12px] bg-[#040B10]" />
            {/if}
            </div>
            <input
              id="membership-image"
              name="membership-image"
              style="display:none"
              type="file"
              class="hs-button is-filled is-large cursor-pointer"
              disabled={membershipExists}
              on:change={onMembershipFileSelected}
            />
          </label>
        </div>
        {#if !isTimeLimitedCollection}
          <div class="mb-16 flex w-[479px] flex-col items-start gap-[7px]">
            <div class="flex items-start gap-[13px]">
              <span class="text-base font-normal text-white"
                >Maximum number of sales</span
              >
              <span class="text-base font-normal uppercase text-[#EB48F8]">
                *
              </span>
            </div>
            <label class="hs-form-field is-filled">
              <input
              bind:value={membership.memberCount}
              on:change={() => onChangeMemberCount(membership)}
              class="hs-form-field__input"
              id="sales-number"
              type="number"
              name="sales-number"
              min="1"
              max="4294967294"
              />
            </label>
          </div>
        {/if}

        <!-- Price -->
        <div class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Price </span>
          <div class="flex w-full max-w-full items-center justify-start gap-1">
            <input
              class="hs-form-field__input grow"
              bind:value={membership.price}
              on:change={() => onChangePrice(membership)}
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
              on:change={() => resetMembershipFee(membership)}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="DEV">DEV</option>
            </select>
          </div>
          <p class="hs-form-field__helper mt-2">
            * If you choose USDC, you can active <u
              >the credit card payment plugin.</u
            >
          </p>
          {#if invalidPriceMsg !== ''}
            <p class="text-danger-300">* {invalidPriceMsg}</p>
          {/if}
        </div>

        <!-- Payment Type -->
        <div class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label"> Payment type </span>
          <div class="flex w-full max-w-full items-center justify-start gap-2">
            <button
              on:click|preventDefault={() =>
                changeMembershipPaymentType(membership, 'instant')}
              class={`hs-form-field__input flex max-w-[33%] grow items-center justify-center gap-2 ${
                membershipPaymentType === 'instant' ? '!border-[#e5e7eb]' : ''
              }`}
              id="membership-fee-instant"
              name="membership-fee-instant"
              disabled={membership.currency === 'DEV'}
            >
              <span class="h-auto w-auto max-w-[48%]">
                <svg
                  width="22"
                  height="19"
                  viewBox="0 0 22 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.69141 1.75H5.60341C5.12236 1.75009 4.654 1.90435 4.26705 2.19015C3.8801 2.47595 3.59494 2.87824 3.45341 3.338L1.04141 11.177C0.975343 11.3911 0.941638 11.6139 0.941406 11.838V16C0.941406 16.5967 1.17846 17.169 1.60042 17.591C2.02237 18.0129 2.59467 18.25 3.19141 18.25H18.1914C18.7881 18.25 19.3604 18.0129 19.7824 17.591C20.2044 17.169 20.4414 16.5967 20.4414 16V11.838C20.4414 11.614 20.4074 11.391 20.3414 11.177L17.9314 3.338C17.7899 2.87824 17.5047 2.47595 17.1178 2.19015C16.7308 1.90435 16.2625 1.75009 15.7814 1.75H13.6914M0.941406 11.5H4.80141C5.2192 11.5001 5.62872 11.6165 5.98408 11.8363C6.33944 12.056 6.6266 12.3703 6.81341 12.744L7.06941 13.256C7.25628 13.6299 7.54361 13.9443 7.89916 14.164C8.25471 14.3837 8.66444 14.5001 9.08241 14.5H12.3004C12.7184 14.5001 13.1281 14.3837 13.4837 14.164C13.8392 13.9443 14.1265 13.6299 14.3134 13.256L14.5694 12.744C14.7563 12.3701 15.0436 12.0557 15.3992 11.836C15.7547 11.6163 16.1644 11.4999 16.5824 11.5H20.4414M10.6914 1V9.25M10.6914 9.25L7.69141 6.25M10.6914 9.25L13.6914 6.25"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span
                class={membershipPaymentType === 'instant' ? 'text-white' : ''}
                >Instant</span
              >
            </button>
            <button
              on:click|preventDefault={() =>
                changeMembershipPaymentType(membership, 'stake')}
              class={`hs-form-field__input flex max-w-[33%] grow items-center justify-center gap-2 ${
                membershipPaymentType === 'stake' ? '!border-[#e5e7eb]' : ''
              }`}
              id="membership-fee-stake"
              name="membership-fee-stake"
              disabled={membership.currency === 'DEV'}
            >
              <span class="h-auto w-auto max-w-[48%]">
                <svg
                  width="22"
                  height="20"
                  viewBox="0 0 22 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.32422 1V12.25C2.32422 12.8467 2.56127 13.419 2.98323 13.841C3.40519 14.2629 3.97748 14.5 4.57422 14.5H6.82422M2.32422 1H0.824219M2.32422 1H18.8242M6.82422 14.5H14.3242M6.82422 14.5L5.82422 17.5M18.8242 1H20.3242M18.8242 1V12.25C18.8242 12.8467 18.5872 13.419 18.1652 13.841C17.7433 14.2629 17.171 14.5 16.5742 14.5H14.3242M14.3242 14.5L15.3242 17.5M5.82422 17.5H15.3242M5.82422 17.5L5.32422 19M15.3242 17.5L15.8242 19M6.07422 10L9.07422 7L11.2222 9.148C12.2314 7.69929 13.5464 6.48982 15.0742 5.605"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class={membershipPaymentType === 'stake' ? 'text-white' : ''}>
                Stake
              </span>
            </button>
            <div class="max-w-[33%] grow">
              {#if membershipPaymentType !== 'custom'}
                <button
                  on:click|preventDefault={() =>
                    changeMembershipPaymentType(membership, 'custom')}
                  class="hs-form-field__input w-full max-w-full"
                  id="membership-fee-custom"
                  name="membership-fee-custom"
                  disabled={membership.currency === 'DEV'}>Custom</button
                >
              {/if}
              {#if membershipPaymentType === 'custom'}
                <input
                  bind:value={membershipCustomFee100}
                  on:change={() => onChangeCustomFee(membership)}
                  on:keyup={validateCustomMembershipFee}
                  class={`hs-form-field__input w-full max-w-full ${
                    membershipPaymentType === 'custom'
                      ? '!border-[#e5e7eb]'
                      : ''
                  }`}
                  id="membership-fee-value"
                  name="membership-fee-value"
                  type="number"
                  disabled={membership.currency === 'DEV'}
                  min={minCustomFee100}
                  max={maxCustomFee100}
                />
              {/if}
            </div>
          </div>
          {#if membership.currency === 'DEV'}
            <p class="hs-form-field__helper mt-2">
              * Payment type option is currently disabled for DEV
            </p>
          {/if}
          {#if invalidFeeMsg !== ''}
            <p class="text-danger-300">* {invalidFeeMsg}</p>
          {/if}
        </div>

        <!-- Earning info -->
        <div class="hs-form-field">
          <div class="flex w-full max-w-full gap-0 p-0">
            <div
              style="width: {(membership.fee?.percentage || 0) *
                100}% !important"
              class="h-6 max-w-full rounded-[99px] bg-[#00D0FD]"
            ></div>
            <div
              style="width: {100 -
                (membership.fee?.percentage || 0) * 100}% !important"
              class="h-6 max-w-full rounded-[99px] bg-[#43C451]"
            ></div>
          </div>
          <p class="mt-1">
            <span class="text-[#00D0FD]"
              >{BigNumber(membership.price * (membership.fee?.percentage || 0))
                .dp(5)
                .toString()}
              {membership.currency} ({BigNumber(
                (membership.fee?.percentage || 0) * 100,
              )
                .dp(3)
                .toString()}%)</span
            >
            will earn at 1 time,
            <span class="text-[#43C451]"
              >and {BigNumber(
                membership.price * (1 - (membership.fee?.percentage || 0)),
              )
                .dp(5)
                .toString()} ({BigNumber(
                (1 - (membership.fee?.percentage || 0)) * 100,
              )
                .dp(3)
                .toString()}%)
            </span> will be staked to earn dev continuously.
          </p>
          <p class="hs-form-field__helper mt-2">
            * <u>What is staking?</u>
          </p>
        </div>

        <!-- Description -->
        <div
          class="mb-16 flex w-[99.1%] flex-col items-start justify-start gap-[7px]"
        >
          <div class="m-0 w-full items-center p-0">
            <span class="mr-[13px] font-body">Description</span>
            <span class="font-body text-[#EB48F8]"> * </span>
          </div>
          <label class="hs-form-field is-filled">
            <textarea
            class="hs-form-field__input"
            bind:value={membership.description}
            on:change={updateState}
            id="membership-description"
            name="membership-description"
            disabled={membershipExists}
            />
          <p class="hs-form-field__helper">Markdown is available</p>
          </label>
        </div>

        <!-- Save & Delete Buttons -->
        <div class="mb-16 flex items-start gap-16">
          <button
            on:click={() => update()}
            type="button"
            class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white`}
            >
            Save
          </button>

          {#if mode === 'edit' && !membership.deprecated}
            <button
              class={`hs-button is-large is-filled w-fit rounded px-8 py-6 text-base font-bold text-white ${
                updatingMembershipsStatus ? 'animate-pulse bg-gray-500/60' : ''
              }`}
              type="button"
              on:click|preventDefault={() => deleteMembership(membership)}
            >
              <span class="hs-button__label"> Delete </span>
            </button>
          {/if}
        </div>
      {/if}
    </div>
    <!-- Previous Memberships -->
    <div class="grid grid-cols-3 justify-between gap-4">
      {#each collection.memberships as mem, i}
        {#if mem.id !== membership.id}
        <div>
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
        <a
        class="hs-button is-filled is-fullwidth mt-4 rounded px-8 py-6 text-base font-bold text-white"
        href={`${collection.id}/${mem.id}`}
      >
        <span class="hs-button__label">Edit</span>
      </a>
        </div>
        {/if}
    {/each}
    </div>
  </div>
</form>