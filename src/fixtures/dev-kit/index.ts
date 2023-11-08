import {
  BrowserProvider,
  type ContractRunner,
  ZeroAddress,
  parseUnits,
} from 'ethers'
import {
  clientsSTokens,
  clientsProperty,
  clientsLockup,
} from '@devprotocol/dev-kit/agent'
import { type UndefinedOr } from '@devprotocol/util-ts'
import { positionsCreate } from '@devprotocol/dev-kit'

export type ChainName = UndefinedOr<
  | 'ethereum'
  | 'ropsten'
  | 'arbitrum-one'
  | 'arbitrum-rinkeby'
  | 'polygon'
  | 'polygon-mumbai'
>

export const detectChain = async (ethersProvider?: BrowserProvider) => {
  const res = await ethersProvider?.getNetwork()
  const chainId = Number(res?.chainId)
  const name: ChainName =
    chainId === 1
      ? 'ethereum'
      : chainId === 3
      ? 'ropsten'
      : chainId === 42161
      ? 'arbitrum-one'
      : chainId === 421611
      ? 'arbitrum-rinkeby'
      : chainId === 137
      ? 'polygon'
      : chainId === 80001
      ? 'polygon-mumbai'
      : undefined

  return { chainId, name }
}

export const getStokenPositions = async (
  prov: ContractRunner,
  sTokenID: number,
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positions(sTokenID)
}

export const getStokenOwnerOf = async (
  prov: ContractRunner,
  sTokenID: number,
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.ownerOf(sTokenID)
}

export const getStokenTokenURI = async (
  prov: ContractRunner,
  sTokenID: number,
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.tokenURI(sTokenID)
}

export const detectStokensByPropertyAddress = async (
  prov: ContractRunner,
  propertyAddress: string,
) => {
  if (propertyAddress === ZeroAddress) {
    return undefined
  }
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positionsOfProperty(propertyAddress)
}

export const balanceOfProperty = async (
  prov: ContractRunner,
  propertyAddress: string,
  accountAddress: string,
) => {
  if (propertyAddress === ZeroAddress) {
    return undefined
  }
  const [l1, l2] = await clientsProperty(prov, propertyAddress)
  if (accountAddress) {
    return (l1 || l2)?.balanceOf(accountAddress)
  }
  return undefined
}

export const positionsOfOwner = async (
  prov: ContractRunner,
  accountAddress: string,
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positionsOfOwner(accountAddress)
}

export const getBalances = async (
  prov: ContractRunner,
  propertyAddress: string,
) => {
  if (propertyAddress === ZeroAddress) {
    return undefined
  }
  // only for L2
  const [, l2] = await clientsProperty(prov, propertyAddress)
  return l2?.getBalances()
}

export const stake = async (
  provider: ContractRunner,
  propertyAddress: string,
  from: string,
  devAmount: number | string,
) => {
  const amount = parseUnits(devAmount.toString(), 18).toString()
  const res = await positionsCreate({
    provider,
    from,
    amount,
    destination: propertyAddress,
  })
  return res
}

export const calculateRewardAmount = async (
  prov: ContractRunner,
  propertyAddress: string,
) => {
  const [l1, l2] = await clientsLockup(prov)
  return (l1 || l2)?.calculateRewardAmount(propertyAddress)
}

export const propertySymbol = async (
  prov: ContractRunner,
  propertyAddress: string,
) => {
  if (propertyAddress === ZeroAddress) {
    return undefined
  }
  const [l1, l2] = await clientsProperty(prov, propertyAddress)
  return (l1 || l2)?.symbol()
}
