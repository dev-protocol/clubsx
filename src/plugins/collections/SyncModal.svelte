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
  import type { ExpectedStatus } from '@components/Collections/types'
  import SyncStatus from '@components/Collections/SyncStatus.svelte'

  export let collections: Collection[] = []
  export let propertyAddress: string
  export let chainId: number
  export let rpcUrl: string

  const customdescriptor = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.address

  const expectedMemberships: ExpectedStatus[] = collections.flatMap(
    (collection) =>
      collection.memberships.map((mem) => {
        const { decimals, address: token } = tokenInfo[mem.currency][chainId]
        return {
          payload: bytes32Hex(mem.payload),
          source: mem,
          isTimeLimitedCollection: true,
          state: {
            src: mem.imageSrc,
            name: JSON.stringify(mem.name).slice(1, -1),
            description: JSON.stringify(mem.description).slice(1, -1),
            deadline: collection.endTime ? BigInt(collection.endTime) : 0n,
            members: mem.memberCount ? BigInt(mem.memberCount) : 0n,
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
    const validStates = states.filter(({ payload }) => payload.trim() !== '')

    const results: TransactionResponse[] = []
    if (validStates.length) {
      const res = await callSlotCollections(provider, 'setImages', [
        propertyAddress,
        validStates.map(({ state }) => state),
        validStates.map(({ payload }) => payload),
      ])
      results.push(res)
    }
    return results
  }
</script>

<SyncStatus
  {customdescriptor}
  expected={expectedMemberships}
  {stateFetcher}
  {stateSetter}
  {propertyAddress}
  {rpcUrl}
/>
