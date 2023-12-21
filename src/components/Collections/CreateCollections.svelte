<script lang="ts">
  import { ClubsEvents, setOptions } from '@devprotocol/clubs-core'
  import { buildConfig } from '@devprotocol/clubs-core'
  import type { Collection, CollectionMembership } from '@plugins/collections'
  import MembershipOption from '@components/AdminMembershipsForm/MembershipOption.svelte'
  import { uploadImageAndGetPath } from '@fixtures/imgur'
  import {
    DEV_TOKEN_PAYMENT_TYPE_FEE,
    PAYMENT_TYPE_INSTANT_FEE,
    PAYMENT_TYPE_STAKE_FEE,
  } from '@constants/memberships'

  import {
    emptyDummyImage,
    formatUnixTimestamp,
  } from '@plugins/collections/fixtures'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'
  import {
    randomBytes,
    JsonRpcProvider,
    ZeroAddress,
    type Signer,
  } from 'ethers'
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'
  import { clientsSTokens } from '@devprotocol/dev-kit'
  import { bytes32Hex } from '@devprotocol/clubs-core'
  import type { Membership } from '@plugins/memberships'

  export let existingCollections: Collection[] = []
  export let existingMemberships: Membership[] = []
  export let collection: Collection
  export let clubName: string | undefined = undefined
  export let isAdding: boolean = false
  export let useOnFinishCallback: boolean = false
  export let currentPluginIndex: number

  export let mode: 'edit' | 'editMem' | 'create' = 'create'
  export let rpcUrl: string
  export let propertyAddress: string | null | undefined = undefined

  let connection: typeof Connection
  let signer: Signer | undefined
  let currentAddress: string | undefined
  let showDateRow = false
  let showSaleLimitRow = false
  function toggleDateRow() {
    showDateRow = !showDateRow
    saleDurationType = ''
    collection = {
      ...collection,
      endTime: 0,
    }
  }
  function toggleSaleLimitRow() {
    showSaleLimitRow = !showSaleLimitRow
    saleLimitType = ''
    membership = {
      ...membership,
      memberCount: 0,
    }
  }

  type SaleDurationType = '1week' | '30days' | 'custom' | ''
  type SaleLimitType = '10' | '100' | 'custom' | ''
  type MembershipPaymentType = 'instant' | 'stake' | 'custom' | ''
  // note: treat this variable as state variable which stores the state for memberships edits and also for storing in DB
  const defaultMembership: CollectionMembership = {
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
    memberCount: 0,
  }
  export let membership: CollectionMembership = {
    ...defaultMembership,
  }

  let membershipPaymentType: MembershipPaymentType =
    membership.paymentType ?? (membership.currency === 'DEV' ? 'custom' : '')
  let saleDurationType: SaleDurationType = collection.endTime ? 'custom' : ''
  let saleLimitType: SaleLimitType = membership.memberCount ? 'custom' : ''
  let membershipCustomFee100: number = membership.fee
    ? membership.fee.percentage * 100
    : membership.currency === 'DEV'
      ? DEV_TOKEN_PAYMENT_TYPE_FEE * 100
      : 0
  let updatingMembershipsStatus: Set<string> = new Set()
  let globalUpdateState = {
    isLoading: false,
  }
  let unSavedMemberships: string[] = []
  let noOfPositions: number = 0
  let invalidPriceMsg: string = ''
  let invalidFeeMsg: string = ''
  let invalidEndTimeMsg: string = ''

  const originaCollectionlId = collection.id
  const originalMembershipId = membership.id
  const provider = new JsonRpcProvider(rpcUrl)

  let membershipExists = false
  let loading = false

  const minPrice = 0.000001
  const maxPrice = 1e20
  const minCustomFee100 = 0
  const maxCustomFee100 = 95

  function setLoading(isLoading: boolean) {
    globalUpdateState.isLoading = isLoading
  }

  // TODO: call this function on save btn trigger as well.
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
    },
  ) => {
    if (!e.currentTarget.files || !collection) {
      return
    }
    setLoading(true)

    const file = e.currentTarget.files[0]

    collection.imageSrc =
      (await uploadImageAndGetPath(file)) || emptyDummyImage(2400, 1200)

    collection = collection

    update()
    setLoading(false)
  }

  const onMembershipFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    },
  ) => {
    if (!e.currentTarget.files || !membership) {
      return
    }
    setLoading(true)
    const file = e.currentTarget.files[0]

    membership.imageSrc =
      (await uploadImageAndGetPath(file)) || emptyDummyImage(400, 400)

    updateState()
    update()
    setLoading(false)
  }

  const deleteMembership = (selectedMembership: CollectionMembership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${JSON.stringify(selectedMembership.payload)}`,
    ])

    const membership = collection.memberships.find(
      (m: CollectionMembership) =>
        JSON.stringify(m.payload) ===
        JSON.stringify(selectedMembership.payload),
    )

    if (!membership) {
      return
    }

    setOptions(
      [
        {
          key: 'collections',
          value: [
            ...existingCollections.filter(
              (c: Collection) => c.id !== collection.id,
            ),
            {
              ...collection,
              memberships: [
                ...collection.memberships.filter(
                  (m: CollectionMembership) => m.id !== membership.id,
                ),
                { ...selectedMembership, deprecated: true },
              ],
            },
          ],
        },
      ],
      currentPluginIndex,
    )

    setTimeout(buildConfig, 50)
  }

  const activateMembership = (selectedMembership: CollectionMembership) => {
    updatingMembershipsStatus = new Set([
      ...updatingMembershipsStatus.values(),
      `${JSON.stringify(selectedMembership.payload)}`,
    ])

    const membership = collection.memberships.find(
      (m: CollectionMembership) =>
        JSON.stringify(m.payload) ===
        JSON.stringify(selectedMembership.payload),
    )

    if (!membership) {
      return
    }

    setOptions(
      [
        {
          key: 'collections',
          value: [
            ...existingCollections.filter(
              (c: Collection) => c.id !== collection.id,
            ),
            {
              ...collection,
              memberships: [
                ...collection.memberships.filter(
                  (m: CollectionMembership) => m.id !== membership.id,
                ),
                { ...selectedMembership, deprecated: false },
              ],
            },
          ],
        },
      ],
      currentPluginIndex,
    )
    setTimeout(buildConfig, 50)
  }
  const handleStatusChange = async (event: Event) => {
    const value =
      ((event.target as HTMLInputElement)?.value as 'Draft' | 'Published') ||
      'Draft'
    collection = {
      ...collection,
      status: value,
    }
  }

  let formattedEndTime = formatUnixTimestamp(
    collection.endTime || new Date().getTime() / 1000 + 120,
  )

  const onEndTimeChange = async (event: Event) => {
    const value = (event.target as HTMLInputElement)?.value || 0
    const passedUnixTime = Math.round(new Date(value).getTime() / 1000)
    const currentTime = Math.round(Date.now() / 1000)
    if (passedUnixTime <= currentTime) {
      const twoMinutes = 120
      collection = {
        ...collection,
        endTime: currentTime + twoMinutes,
      }
      formattedEndTime = formatUnixTimestamp(currentTime + twoMinutes)
      invalidEndTimeMsg = 'Invalid Time: Minimum allowed 2 minutes from now.'
    } else {
      invalidEndTimeMsg = ''
      collection = {
        ...collection,
        endTime: passedUnixTime,
      }
      formattedEndTime = formatUnixTimestamp(passedUnixTime)
    }
  }

  const onChangeMemberCount = async (
    selectedMembership: CollectionMembership,
  ) => {
    const value = selectedMembership.memberCount ?? 0

    if (value < 1) {
      selectedMembership.memberCount = 1
      // Safe range: Maximum permitted value is 4294967295
    } else if (value > 999999999) {
      selectedMembership.memberCount = 999999999
    } else {
      invalidPriceMsg = ''
    }
    if (
      selectedMembership.memberCount === 0 ||
      !selectedMembership.memberCount
    ) {
      return
    }
    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== selectedMembership.id,
        ),
        {
          ...selectedMembership,
        },
      ],
    }
    membership = selectedMembership
  }

  const onChangeCustomFee = async (
    selectedMembership: CollectionMembership,
  ) => {
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
        paymentType: 'custom',
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id,
          ),
          {
            ...selectedMembership,
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
      paymentType: 'custom',
    }
    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== selectedMembership.id,
        ),
        {
          ...selectedMembership,
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

  const changeSaleDurationType = async (type: SaleDurationType) => {
    const currentTime = Math.round(Date.now() / 1000)
    if (type === '1week') {
      collection = {
        ...collection,
        endTime: currentTime + 604800,
      }
      formattedEndTime = formatUnixTimestamp(currentTime + 604800)
      saleDurationType = '1week'
    }
    if (type === '30days') {
      collection = {
        ...collection,
        endTime: currentTime + 2592000,
      }
      formattedEndTime = formatUnixTimestamp(currentTime + 2592000)
      saleDurationType = '30days'
    }
    if (type === 'custom') {
      saleDurationType = 'custom'
    }
    update()
  }

  const changeSaleLimitType = async (type: SaleLimitType) => {
    if (type === '10') {
      membership = {
        ...membership,
        memberCount: 10,
      }
      saleLimitType = '10'
    }
    if (type === '100') {
      membership = {
        ...membership,
        memberCount: 100,
      }
      saleLimitType = '100'
    }
    if (type === 'custom') {
      saleLimitType = 'custom'
    }
    update()
  }

  const changeMembershipPaymentType = async (
    selectedMembership: CollectionMembership,
    type: MembershipPaymentType,
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
        paymentType: 'custom',
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id,
          ),
          {
            ...selectedMembership,
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
        paymentType: 'instant',
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id,
          ),
          {
            ...selectedMembership,
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
        paymentType: 'stake',
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id,
          ),
          {
            ...selectedMembership,
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
        paymentType: 'custom',
      }
      collection = {
        ...collection,
        memberships: [
          ...collection.memberships.filter(
            (m: CollectionMembership) => m.id !== selectedMembership.id,
          ),
          {
            ...selectedMembership,
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
        3,
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
      paymentType: 'custom',
    }
    collection = {
      ...collection,
      memberships: [
        ...collection.memberships.filter(
          (m: CollectionMembership) => m.id !== selectedMembership.id,
        ),
        {
          ...selectedMembership,
        },
      ],
    }
    membership = selectedMembership
  }

  const setIsAdding = (value: boolean) => {
    isAdding = value
  }

  const updateState = () => {
    if (membership.id === '' || !membership.id) onChangeName()

    if (
      membership.price < minPrice ||
      membership.price > maxPrice ||
      membershipPaymentType === ''
    )
      return
    const searchMembershipId =
      mode === 'editMem' ? originalMembershipId : membership.id

    collection = {
      ...collection,
      memberships: isAdding // If we are adding/editing memberships only then append the membership state to db.
        ? collection.memberships.some(({ id }) => id === searchMembershipId)
          ? [
              ...collection.memberships.map((_mem) =>
                _mem.id === searchMembershipId ? membership : _mem,
              ),
            ]
          : [
              ...collection.memberships.filter(
                (m: CollectionMembership) => m.id !== membership.id,
              ),
              membership,
            ]
        : collection.memberships,
    }
  }

  const update = () => {
    // OR condition with editMem is that, if the membership exists then it implies the collections exist first
    const searchCollectionId =
      mode === 'edit' || 'editMem' ? originaCollectionlId : collection.id
    const newCollections = [
      ...existingCollections.filter(
        (c: Collection) => c.id !== searchCollectionId,
      ),
      collection,
    ]
    setOptions(
      [{ key: 'collections', value: newCollections }],
      currentPluginIndex,
    )
  }

  const handleSaveClick = () => {
    updateState()
    update()
    setIsAdding(false)
    // We are not using unSavedMemberships.push(bytes32Hex(membership.payload)) because of svelete's reactivity issue
    unSavedMemberships = [...unSavedMemberships, bytes32Hex(membership.payload)]
    membership = {
      ...defaultMembership,
    }
    membership.payload = randomBytes(8)
    onChangePrice(membership)
    // since editMem is a existing DB entry, its state updation should be handled individually
    if (mode === 'editMem') {
      setTimeout(buildConfig, 50)
    }
  }
  const selectAllowlist = (mem: Membership) => {
    // if mem.payload already exists in collection.requiredMemberships then remove it otherwise add it to collection.requiredMemberships
    collection.requiredMemberships = collection.requiredMemberships
      ? collection.requiredMemberships.includes(bytes32Hex(mem.payload))
        ? collection.requiredMemberships.filter(
            (m: Uint8Array | string) => m !== bytes32Hex(mem.payload),
          )
        : [...collection.requiredMemberships, bytes32Hex(mem.payload)]
      : [bytes32Hex(mem.payload)]
    update()
    console.log(
      'collection.requiredMemberships',
      collection.requiredMemberships,
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
    if (!ev.detail.success) {
      return
    }
    location.href = new URL(
      '/admin/collections/?ping=publish',
      location.origin,
    ).toString()
  }
</script>

<form on:change|preventDefault={() => update()} class="w-full">
  <div class="grid gap-16">
    <!-- collection name -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Collection name </span>
      <input
        bind:value={collection.name}
        on:change={onCollectionChangeName}
        class="hs-form-field__input w-full max-w-md"
        id="collection-name"
        name="collection-name"
      />
    </label>
    <!-- Status -->
    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Status</span>
      <select
        class="hs-form-field__input w-full max-w-md"
        id="collection-status"
        name="collection-status"
        bind:value={collection.status}
        on:change={handleStatusChange}
      >
        <option value="Draft">Draft</option>
        <option value="Published">Published</option>
      </select>
    </label>
    <!-- collection cover image uploader-->
    <label class="hs-form-field is-filled max-w-xl is-required">
      <span class="hs-form-field__label">Collection cover image</span>
      <div
        class="aspect-[2/1] w-full cursor-pointer rounded-xl border border-[#ffffff1a] bg-[#ffffff1a] p-2"
      >
        {#if collection.imageSrc !== ''}
          <img
            class="h-full w-full rounded-xl object-cover"
            src={collection.imageSrc}
            alt={`${collection.name}-collection-cover-image`}
          />
        {:else}
          <div
            class={`h-full w-full rounded-xl ${
              globalUpdateState.isLoading
                ? 'animate-pulse bg-gray-500/60'
                : 'bg-dp-blue-grey-600'
            }`}
          />
        {/if}
      </div>
      <input
        id="collection-cover-image"
        name="collection-cover-image"
        style="display:none"
        type="file"
        accept=".jpg, .jpeg, .png, .gif, .apng, .tiff"
        class="cursor-pointer"
        on:change={onCollectionFileSelected}
      />
      <span class="hs-form-field__helper"
        >Recommended image size is 2400 x 1200px</span
      >
    </label>
    <div class="grid w-full max-w-md items-center justify-start gap-2">
      <button
        on:click|preventDefault={() => toggleDateRow()}
        class={`hs-button is-filled`}
        id="collection-end-time"
        name="collection-end-time"
      >
        {collection.endTime !== 0
          ? 'Reset'
          : showDateRow
            ? 'Cancel'
            : 'Set Sale Duration'}
      </button>
      {#if showDateRow}
        <div class="grid grid-cols-3 gap-2">
          <button
            on:click|preventDefault={() => changeSaleDurationType('1week')}
            class={`hs-button ${
              saleDurationType === '1week' ? 'is-filled' : 'border-white'
            }`}
            id="collection-end-time"
            name="collection-end-time"
          >
            1 Week
          </button>
          <button
            on:click|preventDefault={() => changeSaleDurationType('30days')}
            class={`hs-button ${
              saleDurationType === '30days' ? 'is-filled' : 'border-white'
            }`}
            id="collection-end-time"
            name="collection-end-time"
          >
            30 Days
          </button>
          <button
            on:click|preventDefault={() => changeSaleDurationType('custom')}
            class={`hs-button ${
              saleDurationType === 'custom' ? 'is-filled' : 'border-white'
            }`}
            id="collection-end-time"
            name="collection-end-time"
          >
            Custom
          </button>
        </div>
      {/if}
      {#if saleDurationType === 'custom'}
        <label class="grid hs-form-field is-filled is-required">
          <input
            bind:value={formattedEndTime}
            on:change={onEndTimeChange}
            type="datetime-local"
            class="hs-form-field__input w-full max-w-md"
            id="collectino-start-date"
            name="collection-start-date"
            min={formatUnixTimestamp(Date.now() / 1000)}
            max="2038-01-18T00:00"
          />
          {#if invalidEndTimeMsg !== ''}
            <p class="text-danger-300">* {invalidEndTimeMsg}</p>
          {/if}
        </label>
      {/if}
    </div>

    <label class="hs-form-field is-filled is-required">
      <span class="hs-form-field__label">Description</span>
      <textarea
        class="hs-form-field__input"
        id="collection-description"
        name="collection-description"
        rows="3"
        bind:value={collection.description}
      />
      <p class="hs-form-field__helper">Markdown is available</p>
    </label>

    <!-- Allowlist -->
    <div class="hs-form-field grid gap-2">
      <span class="hs-form-field__label">Allowlist</span>
      <label
        class="flex items-center rounded-md bg-dp-blue-grey-600 p-5 cursor-pointer"
        for="access"
      >
        <input
          id="access"
          name="notification-method"
          type="radio"
          checked={collection.requiredMemberships?.length === 0}
          class="h-4 w-4 border-gray-300 text-[#3043EB] focus:ring-[#3043EB] dark:focus:ring-[#3043EB]"
          on:change={() => {
            collection.requiredMemberships = []
            update()
          }}
        />
        <span class="ml-3 block text-justify text-base font-normal text-white"
          >Public access (Open to everyone for purchase)</span
        >
      </label>
      <span
        >Choose membership requirements for collection access. To add more
        memberships, click [<a href="/admin/memberships" class="hs-link">here</a
        >].</span
      >
      <div
        class="grid sm:grid-cols-4 md:grid-cols-3 justify-between gap-4 pt-2.5"
      >
        {#each existingMemberships as mem, i}
          <div
            on:click={() => selectAllowlist(mem)}
            on:keydown={(e) => {
              if (e.key === 'Enter') selectAllowlist(mem)
            }}
            role="button"
            tabindex="0"
          >
            <MembershipOption
              clubName={clubName ?? 'Your Club'}
              id={mem.id}
              name={mem.name}
              imagePath={mem.imageSrc.trim().length > 0
                ? mem.imageSrc
                : emptyDummyImage(400, 400)}
              price={mem.price.toString()}
              currency={mem.currency}
              description={mem.description}
              extendable={false}
              className={`${
                collection.requiredMemberships?.includes(
                  bytes32Hex(mem.payload),
                )
                  ? 'outline outline-4 outline-native-blue-300'
                  : 'opacity-70'
              } transition h-full lg:row-start-3 hover:opacity-100`}
            />
          </div>
        {/each}
      </div>
    </div>

    <!-- collection items -->
    {#if !isAdding}
      <h1 class="mb-16 font-title text-2xl font-bold">Collection Items</h1>
      <button
        class={`hs-button is-filled is-large`}
        on:click={() => setIsAdding(true)}
      >
        + Add
      </button>
    {/if}

    <!-- Register New Item -->
    <div class="grid w-full gap-8">
      {#if isAdding}
        <h1 class="mb-16 font-title text-2xl font-bold">Register New Item</h1>
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label">Name</span>
          <input
            bind:value={membership.name}
            on:change={onChangeName}
            class="hs-form-field__input w-full max-w-md"
            id="product-name"
            name="product-name"
            placeholder="Name of product"
          />
        </label>
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label">Image</span>
          <div
            class="aspect-square w-full max-w-sm cursor-pointer rounded-xl border border-[#ffffff1a] bg-[#ffffff1a] p-2"
          >
            {#if membership.imageSrc !== ''}
              <img
                class="h-full w-full rounded-xl object-cover"
                src={membership.imageSrc}
                alt={`${membership.name}-membership-image`}
              />
            {:else}
              <div
                class={`h-full w-full rounded-xl ${
                  globalUpdateState.isLoading
                    ? 'animate-pulse bg-gray-500/60'
                    : 'bg-dp-blue-grey-600'
                }`}
              />
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
        <div class="grid w-full max-w-md items-center justify-start gap-2">
          <button
            on:click|preventDefault={() => toggleSaleLimitRow()}
            class={`hs-button is-filled`}
            id="sales-number"
            name="sales-number"
          >
            {membership.memberCount !== 0
              ? 'Reset'
              : showSaleLimitRow
                ? 'Cancel'
                : 'Set Sale Limit'}
          </button>
          {#if showSaleLimitRow}
            <div class="grid grid-cols-3 gap-2">
              <button
                on:click|preventDefault={() => changeSaleLimitType('10')}
                class={`hs-button ${
                  saleLimitType === '10' ? 'is-filled' : 'border-white'
                }`}
                id="collection-end-time"
                name="collection-end-time"
              >
                10
              </button>
              <button
                on:click|preventDefault={() => changeSaleLimitType('100')}
                class={`hs-button ${
                  saleLimitType === '100' ? 'is-filled' : 'border-white'
                }`}
                id="collection-end-time"
                name="collection-end-time"
              >
                100
              </button>
              <button
                on:click|preventDefault={() => changeSaleLimitType('custom')}
                class={`hs-button ${
                  saleLimitType === 'custom' ? 'is-filled' : 'border-white'
                }`}
                id="collection-end-time"
                name="collection-end-time"
              >
                Custom
              </button>
            </div>
          {/if}
          {#if saleLimitType === 'custom'}
            <label class="hs-form-field is-filled is-required">
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
          {/if}
        </div>
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
              <span
                class={membershipPaymentType === 'stake' ? 'text-white' : ''}
              >
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
        <label class="hs-form-field is-filled is-required">
          <span class="hs-form-field__label">Description</span>
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

        <!-- Save & Delete Buttons -->
        <div class="mb-8 flex items-start gap-16">
          <button
            on:click={() => handleSaveClick()}
            class={`hs-button is-filled is-large`}
            disabled={collection.endTime === 0 && membership.memberCount === 0}
          >
            {mode === 'editMem' ? 'Save' : 'Add to Collection'}
          </button>

          {#if mode === 'editMem' && !membership.deprecated}
            <button
              disabled={updatingMembershipsStatus.has(
                `${JSON.stringify(membership.payload)}`,
              )}
              class={`hs-button is-filled is-large is-error ${
                updatingMembershipsStatus.has(
                  `${JSON.stringify(membership.payload)}`,
                )
                  ? 'animate-pulse bg-gray-500/60'
                  : ''
              }`}
              on:click|preventDefault={() => deleteMembership(membership)}
            >
              <span class="hs-button__label"> Delete </span>
            </button>
          {/if}
          {#if mode === 'editMem' && membership.deprecated}
            <button
              disabled={updatingMembershipsStatus.has(
                `${JSON.stringify(membership.payload)}`,
              )}
              class={`hs-button is-filled is-large ${
                updatingMembershipsStatus.has(
                  `${JSON.stringify(membership.payload)}`,
                )
                  ? 'animate-pulse bg-gray-500/60'
                  : ''
              }`}
              on:click|preventDefault={() => activateMembership(membership)}
            >
              <span class="hs-button__label"> Activate </span>
            </button>
          {/if}
        </div>
        {#if collection.endTime === 0 && membership.memberCount === 0}
          <span class="text-red-600"
            >**Sale Duration, Sale Limit Both Cannot be Zero</span
          >
        {/if}
      {/if}
    </div>
    <!-- UnSaved Memberships -->
    <h1 class="font-title text-2xl font-bold">{unSavedMemberships.length > 0 ? 'Unsaved Collection Items': ''}</h1>
    <div
      class="grid sm:grid-cols-4 md:grid-cols-3 justify-between gap-4"
    >
      {#each collection.memberships as mem, i}
        {#if mem.id !== membership.id && unSavedMemberships.includes(bytes32Hex(mem.payload))}
          <div class="">
            <MembershipOption
              clubName={clubName ?? 'Your Club'}
              id={mem.id}
              name={mem.name}
              imagePath={mem.imageSrc.trim().length > 0
                ? mem.imageSrc
                : emptyDummyImage(400, 400)}
              price={mem.price.toString()}
              currency={mem.currency}
              description={mem.description}
            />
          </div>
        {/if}
      {/each}
    </div>
    <!-- Previous Memberships -->
    <h1 class="font-title text-2xl font-bold">Existing Collection Items</h1>
    <div
      class="grid grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))] justify-between gap-4"
    >
      {#each collection.memberships as mem, i}
        {#if mem.id !== membership.id && !unSavedMemberships.includes(bytes32Hex(mem.payload))}
          <div>
            <MembershipOption
              clubName={clubName ?? 'Your Club'}
              id={mem.id}
              name={mem.name}
              imagePath={mem.imageSrc.trim().length > 0
                ? mem.imageSrc
                : emptyDummyImage(400, 400)}
              price={mem.price.toString()}
              currency={mem.currency}
              description={mem.description}
            />
            {#if mode !== 'editMem'}
              <a
                class="hs-button is-filled is-fullwidth mt-4"
                href={`${collection.id}/${mem.id}`}
              >
                <span class="hs-button__label">Select</span>
              </a>
              {#if !mem.deprecated}
                <button
                  disabled={updatingMembershipsStatus.has(
                    `${JSON.stringify(mem.payload)}`,
                  )}
                  class={`hs-button is-filled is-fullwidth is-error mt-4 ${
                    updatingMembershipsStatus.has(
                      `${JSON.stringify(mem.payload)}`,
                    )
                      ? 'animate-pulse bg-gray-500/60'
                      : ''
                  }`}
                  id={`delete-opt-${i}`}
                  on:click|preventDefault={() => deleteMembership(mem)}
                >
                  <span class="hs-button__label">Delete</span>
                </button>
              {/if}
              {#if mem.deprecated}
                <button
                  disabled={updatingMembershipsStatus.has(
                    `${JSON.stringify(mem.payload)}`,
                  )}
                  class={`hs-button is-filled is-fullwidth mt-4 ${
                    updatingMembershipsStatus.has(
                      `${JSON.stringify(mem.payload)}`,
                    )
                      ? 'animate-pulse bg-gray-500/60'
                      : ''
                  }`}
                  id={`activate-opt-${i}`}
                  on:click|preventDefault={() => activateMembership(mem)}
                  >Activate</button
                >
              {/if}
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</form>
