<script lang="ts">
    import type { Collection } from '@plugins/collections'
    import { address, callSlotCollections } from '@plugins/collections/utils/slotCollections'
    import {
      type ContractRunner,
      type Signer,
      ZeroAddress,
      parseUnits,
    } from 'ethers'
    import { tokenInfo } from '@constants/common'
    import BigNumber from 'bignumber.js'
    import { bytes32Hex } from '@fixtures/data/hexlify'
    import type { ExpectedStatus } from '@components/Collections/types'
    import SyncStatus from '@components/Collections/SyncStatus.svelte'
  
    export let collections: Collection[] = []
    export let propertyAddress: string
    export let chainId: number
    export let rpcUrl: string
  
    const customTimeDescriptorAddress = address.find(
      ({ chainId: chainId_ }) => chainId_ === chainId,
    )?.addressList.timeSlot
    const customMemberDescriptorAddress = address.find(
      ({ chainId: chainId_ }) => chainId_ === chainId,
    )?.addressList.memberSlot

    const expectedMemberships = collections.flatMap((collection) =>
    collection.memberships.map((mem) => {
      const { decimals, address: token } = tokenInfo[mem.currency][chainId]
      return collection.isTimeLimitedCollection ? {
        payload: bytes32Hex(mem.payload),
        source: mem,
        isTimeLimitedCollection: true,
        state: {
          src: mem.imageSrc,
          name: mem.name,
          description: mem.description,
          deadline: collection.endTime,
          requiredTokenAmount: parseUnits(String(mem.price), decimals),
          requiredTokenFee: mem.fee?.percentage
            ? parseUnits(
                new BigNumber(mem.price).times(mem.fee.percentage).toFixed(),
                decimals,
              )
            : 0n,
          token: token,
          gateway: mem.fee?.beneficiary ?? ZeroAddress,
        },
      } : {
        payload: bytes32Hex(mem.payload),
        source: mem,
        isTimeLimitedCollection: false,
        state: {
          src: mem.imageSrc,
          name: mem.name,
          description: mem.description,
          slots: mem.memberCount,
          requiredTokenAmount: parseUnits(String(mem.price), decimals),
          requiredTokenFee: mem.fee?.percentage
            ? parseUnits(
                new BigNumber(mem.price).times(mem.fee.percentage).toFixed(),
                decimals,
              )
            : 0n,
          token: token,
          gateway: mem.fee?.beneficiary ?? ZeroAddress,
        },
      }
    })
    )
    const stateFetcher = async ({
      provider,
      propertyAddress,
      payload,
      isTimeLimitedCollection,
    }: {
      provider: ContractRunner
      propertyAddress: string
      payload: string
      isTimeLimitedCollection: boolean
    }) => {
      return callSlotCollections(provider, 'propertyImages', isTimeLimitedCollection,[
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
      const timeStates = states.filter(({ isTimeLimitedCollection }) => isTimeLimitedCollection) 
      const memberStates = states.filter(({ isTimeLimitedCollection }) => !isTimeLimitedCollection)
      return( 
        callSlotCollections(provider, 'setImages', true,[
        propertyAddress,
        timeStates.map(({ state }) => state),
        timeStates.map(({ payload }) => payload),
        ]),
        callSlotCollections(provider, 'setImages', false,[
        propertyAddress,
        memberStates.map(({ state }) => state),
        memberStates.map(({ payload }) => payload),
        ])
      )
    }
  </script>
  
  <SyncStatus
    {customTimeDescriptorAddress}
    {customMemberDescriptorAddress}
    expected={expectedMemberships}
    {stateFetcher}
    {stateSetter}
    {propertyAddress}
    {rpcUrl}
  />
  