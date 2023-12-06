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
  addressList: string
}

export const address: Address[] = [
  {
    chainId: 1,
    addressList: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 4,
    addressList: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 42161,
    addressList: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 421611,
    addressList: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 137,
    addressList: '0x0000000000000000000000000000000000000000',
  },
  {
    chainId: 80001,
    addressList: '0x40be0Bc51523E6eF9b1d7F98B8545859efC708c1',
  },
]

const defaultAddress: Address = {
  chainId: 137,
  addressList: '0x0000000000000000000000000000000000000000',
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
    address.find((address) => address.chainId === chainId)?.addressList ||
    defaultAddress.addressList

  const contract = new ethers.Contract(
    addressList,
    mixSlotABI,
    provider,
  )

  const result: TransactionReceipt = await contract[functionName](...args)
  return result
}
