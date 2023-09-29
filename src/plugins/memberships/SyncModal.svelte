<script lang="ts">
  import type { Membership } from '@plugins/memberships'
  import {
    address,
    callSimpleCollections,
  } from '@plugins/memberships/utils/simpleCollections'
  import {
    type ContractRunner,
    type Signer,
    ZeroAddress,
    parseUnits,
  } from 'ethers'
  import { tokenInfo } from '@constants/common'
  import BigNumber from 'bignumber.js'
  import { bytes32Hex } from '@fixtures/data/hexlify'
  import type { ExpectedStatus } from '@components/AdminMembershipsForm/types'
  import SyncStatus from '@components/AdminMembershipsForm/SyncStatus.svelte'

  export let memberships: Membership[] = []
  export let propertyAddress: string
  export let chainId: number
  export let rpcUrl: string

  const customDescriptorAddress = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.address
  const expectedMemberships = memberships.map((mem) => {
    const { decimals, address: token } = tokenInfo[mem.currency][chainId]
    return {
      payload: bytes32Hex(mem.payload),
      source: mem,
      state: {
        src: mem.imageSrc,
        name: mem.name,
        description: mem.description,
        requiredTokenAmount: parseUnits(String(mem.price), decimals),
        requiredTokenFee: mem.fee?.percentage
          ? parseUnits(
              new BigNumber(mem.price).times(mem.fee.percentage).toFixed(),
              decimals,
            )
          : 0n,
        gateway: mem.fee?.beneficiary ?? ZeroAddress,
        token: token,
      },
    }
  })
  console.log({ expectedMemberships })
  const stateFetcher = async ({
    provider,
    propertyAddress,
    payload,
  }: {
    provider: ContractRunner
    propertyAddress: string
    payload: string
  }) => {
    return callSimpleCollections(provider, 'propertyImages', [
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
    return callSimpleCollections(provider, 'setImages', [
      propertyAddress,
      states.map(({ state }) => state),
      states.map(({ payload }) => payload),
    ])
  }
</script>

<SyncStatus
  {customDescriptorAddress}
  expected={expectedMemberships}
  {stateFetcher}
  {stateSetter}
  {propertyAddress}
  {rpcUrl}
/>
