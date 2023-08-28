import type { BaseProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import type {
  TransactionResponse,
  TransactionReceipt,
} from '@ethersproject/abstract-provider'
import { timeABI } from './timeABI'
import { memberABI } from './memberABI'
import type { Image } from './types/setImageArg'

type AddressList = {
  timeSlot: string
  memberSlot: string
}

type Address = {
  chainId: number
  addressList: AddressList
}

export const address: Address[] = [
  {
    chainId: 1,
    addressList: {
      timeSlot: '0x0000000000000000000000000000000000000000',
      memberSlot: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    chainId: 4,
    addressList: {
      timeSlot: '0x0000000000000000000000000000000000000000',
      memberSlot: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    chainId: 42161,
    addressList: {
      timeSlot: '0x0000000000000000000000000000000000000000',
      memberSlot: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    chainId: 421611,
    addressList: {
      timeSlot: '0x0000000000000000000000000000000000000000',
      memberSlot: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    chainId: 137,
    addressList: {
      timeSlot: '0x0000000000000000000000000000000000000000',
      memberSlot: '0x0000000000000000000000000000000000000000',
    },
  },
  {
    chainId: 80001,
    addressList: {
      timeSlot: '0xbE0AFf1B1AA447772e742CC23A96984399235427',
      memberSlot: '0x955AAd5D0DEde7C651f6f35d8024340EB89cF5a6',
    },
  },
]

const defaultAddress: Address = {
  chainId: 137,
  addressList: {
    timeSlot: '0x0000000000000000000000000000000000000000',
    memberSlot: '0x0000000000000000000000000000000000000000',
  },
}

export async function callSlotCollections(
  provider: BaseProvider | ethers.Signer,
  functionName: 'setImages',
  isTimeSlot: boolean,
  args: [propertyAddress: string, images: Image[], keys: string[]],
): Promise<TransactionResponse>

export async function callSlotCollections(
  provider: BaseProvider,
  functionName: 'removeImage',
  isTimeSlot: boolean,
  args: [propertyAddress: string, key: string],
): Promise<TransactionResponse>

export async function callSlotCollections(
  provider: BaseProvider,
  functionName: 'propertyImages',
  isTimeSlot: boolean,
  args: [propertyAddress: string, key: string],
): Promise<Image>

export async function callSlotCollections(
  provider: BaseProvider | ethers.Signer,
  functionName: string,
  isTimeSlot: boolean,
  args: unknown[],
): Promise<unknown> {
  const chainId = await ('getChainId' in provider
    ? (provider as ethers.Signer).getChainId()
    : (provider as BaseProvider).getNetwork()
  ).then((network) => {
    return typeof network === 'number' ? network : network.chainId
  })

  const addressList =
    address.find((address) => address.chainId === chainId)?.addressList ||
    defaultAddress.addressList

  const contract = new ethers.Contract(
    isTimeSlot ? addressList.timeSlot : addressList.memberSlot,
    isTimeSlot ? timeABI : memberABI,
    provider,
  )

  const result: TransactionReceipt = await contract.functions[functionName](
    ...args,
  )
  return result
}
