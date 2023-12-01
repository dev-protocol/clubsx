<script lang="ts">
  import type { Collection } from '@plugins/collections'
  import {
    address,
    callSlotCollections,
  } from '@plugins/collections/utils/slotCollections'
  import {
    type ContractRunner,
    type Signer,
    type TransactionResponse,
    ZeroAddress,
    parseUnits,
  } from 'ethers'
  import { tokenInfo } from '@constants/common'
  import BigNumber from 'bignumber.js'
  import { bytes32Hex } from '@devprotocol/clubs-core'
  import type { ExpectedStatus } from '@components/AdminMembershipsForm/types'
  import SyncStatus from '@components/AdminMembershipsForm/SyncStatus.svelte'

  export let collections: Collection[] = []
  export let propertyAddress: string
  export let chainId: number
  export let rpcUrl: string

  const customMixSlotDescriptorAddress = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.addressList.mixSlot

  const expectedMemberships: ExpectedStatus[] = collections.flatMap(
    (collection) =>
      collection.memberships.map((mem) => {
        const { decimals, address: token } = tokenInfo[mem.currency][chainId]
        return {
          payload: bytes32Hex(mem.payload),
          source: mem,
          state: {
            src: mem.imageSrc,
            name: JSON.stringify(mem.name).slice(1, -1),
            description: JSON.stringify(mem.description).slice(1, -1),
            slots: [
              collection.endTime ? BigInt(collection.endTime) : 0n,
              mem.memberCount ? BigInt(mem.memberCount) : 0n,
            ],
            requiredTokenAmount: parseUnits(String(mem.price), decimals),
            requiredTokenFee: mem.fee?.percentage
              ? parseUnits(
                  new BigNumber(mem.price)
                    .times(mem.fee.percentage)
                    .dp(decimals, 1)
                    .toFixed(),
                  decimals,
                )
              : 0n,
            token: token,
            gateway: mem.fee?.beneficiary ?? ZeroAddress,
          },
        }
      }),
  )
  const stateFetcher = async ({
    provider,
    propertyAddress,
    payload,
  }: {
    provider: ContractRunner
    propertyAddress: string
    payload: string
  }) => {
    return callSlotCollections(provider, 'propertyImages', [
      propertyAddress,
      payload,
    ])
  }
  const stateSetter = async ({
    provider,
    propertyAddress,
    states,
  }: {
    provider: Signer
    propertyAddress: string
    states: ExpectedStatus[]
  }) => {
    // Filter out states with empty payload
    const validMixStates = states.filter(({ payload }) => payload.trim() !== '')

    const results: TransactionResponse = await callSlotCollections(
      provider,
      'setImages',
      [
        propertyAddress,
        validMixStates.map(({ state }) => state),
        validMixStates.map(({ payload }) => payload),
      ],
    )
    return results
  }
</script>

<SyncStatus
  customDescriptorAddress={customMixSlotDescriptorAddress}
  expected={expectedMemberships}
  {stateFetcher}
  {stateSetter}
  {propertyAddress}
  {rpcUrl}
/>
