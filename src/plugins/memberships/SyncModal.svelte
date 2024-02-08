<script lang="ts">
  import { isPriced, type Membership } from '@plugins/memberships'
  import {
    address,
    callSimpleCollections,
  } from '@plugins/memberships/utils/simpleCollections'
  import {
    type ContractRunner,
    type Signer,
    ZeroAddress,
    parseUnits,
    MaxUint256,
  } from 'ethers'
  import { tokenInfo } from '@constants/common'
  import BigNumber from 'bignumber.js'
  import { bytes32Hex } from '@devprotocol/clubs-core'
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
    const isHavingPrice = isPriced(mem)
    const { decimals, address: token } = isHavingPrice
      ? tokenInfo[mem.currency][chainId]
      : { decimals: 1, address: ZeroAddress }
    return {
      payload: bytes32Hex(mem.payload),
      source: mem,
      state: {
        src: mem.imageSrc,
        name: JSON.stringify(mem.name).slice(1, -1),
        description: JSON.stringify(mem.description).slice(1, -1),
        requiredTokenAmount: !isHavingPrice
          ? MaxUint256
          : parseUnits(String(mem.price), decimals),
        requiredTokenFee: !isHavingPrice
          ? MaxUint256
          : mem.fee?.percentage
            ? parseUnits(
                new BigNumber(mem.price)
                  .times(mem.fee.percentage)
                  .dp(decimals, 1)
                  .toFixed(),
                decimals,
              )
            : 0n,
        gateway: !isHavingPrice
          ? ZeroAddress
          : mem.fee?.beneficiary ?? ZeroAddress,
        token: token,
      },
    }
  })

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
