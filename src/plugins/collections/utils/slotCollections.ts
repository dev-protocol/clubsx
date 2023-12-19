import type { BaseProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import type {
  ContractRunner,
  TransactionResponse,
  TransactionReceipt,
  BrowserProvider,
  Signer,
  Provider,
} from 'ethers'
import { mixSlotABI } from './mixSlotABI'
import type { Image } from './types/setImageArg'

type Address = {
  chainId: number
  address: string
}

export const address: Address[] = [
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 4,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 42161,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 421611,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 137,
    address: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 80001,
    address: '0x1d82F8BA629dDfC1Ca971C38d03E087D64Cfd531',
  },
]

const defaultAddress: Address = {
  chainId: 137,
  address: '0x0000000000000000000000000000000000000000',
}

export async function callSlotCollections(
  provider: BrowserProvider | ContractRunner,
  functionName: 'getSlotsLeft',
  args: [propertyAddress: string, key: string],
): Promise<number>

export async function callSlotCollections(
  provider: BrowserProvider | ContractRunner,
  functionName: 'propertyImages',
  args: [propertyAddress: string, key: string],
): Promise<Image>

export async function callSlotCollections(
  provider: Signer | ContractRunner | BrowserProvider,
  functionName: 'setImages',
  args: [propertyAddress: string, images: Image[], keys: string[]],
): Promise<TransactionResponse>

export async function callSlotCollections(
  provider: Signer,
  functionName: 'removeImage',
  args: [propertyAddress: string, key: string],
): Promise<TransactionResponse>

export async function callSlotCollections(
  provider: Signer | ContractRunner | BrowserProvider,
  functionName: string,
  args: unknown[],
): Promise<unknown> {
  const chainId = await ('getNetwork' in provider
    ? (provider as BrowserProvider).getNetwork()
    : ((provider as Signer).provider as Provider).getNetwork()
  ).then((network) => {
    return Number(network.chainId)
  })

  const addressList =
    address.find((address) => address.chainId === chainId)?.address ||
    defaultAddress.address

  const contract = new ethers.Contract(addressList, mixSlotABI, provider)
  console.log({ contract })

  const result: TransactionReceipt = await contract[functionName](...args)
  return result
}
