import { providers, utils } from 'ethers'
import {
  positionsCreateWithEth,
  clientsSTokens,
  clientsProperty,
} from '@devprotocol/dev-kit/agent'
import { UndefinedOr } from '@devprotocol/util-ts'

export type ChainName = UndefinedOr<
  | 'ethereum'
  | 'ropsten'
  | 'arbitrum-one'
  | 'arbitrum-rinkeby'
  | 'polygon'
  | 'polygon-mumbai'
>

export const detectChain = async (ethersProvider?: providers.BaseProvider) => {
  const res = await ethersProvider?.getNetwork()
  const chainId = res?.chainId
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
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positions(sTokenID)
}

export const getStokenOwnerOf = async (
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.ownerOf(sTokenID)
}

export const getStokenTokenURI = async (
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.tokenURI(sTokenID)
}

export const detectStokensByPropertyAddress = async (
  prov: providers.BaseProvider,
  propertyAddress: string
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positionsOfProperty(propertyAddress)
}

export const balanceOfProperty = async (
  prov: providers.BaseProvider,
  propertyAddress: string,
  accountAddress: string
) => {
  const [l1, l2] = await clientsProperty(prov, propertyAddress)
  if (accountAddress) {
    return (l1 || l2)?.balanceOf(accountAddress)
  }
  return undefined
}

export const positionsOfOwner = async (
  prov: providers.BaseProvider,
  accountAddress: string
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positionsOfOwner(accountAddress)
}

export const getBalances = async (
  prov: providers.BaseProvider,
  propertyAddress: string
) => {
  // only for L2
  const [, l2] = await clientsProperty(prov, propertyAddress)
  return l2?.getBalances()
}

export const stakeWithEth = async (
  provider: providers.BaseProvider,
  propertyAddress: string,
  devAmount: string
) => {
  console.log(
    '****',
    utils.parseUnits(devAmount, 18).toString(),
    propertyAddress
  )
  const { estimatedEth, create } = await positionsCreateWithEth({
    provider,
    devAmount: utils.parseUnits(devAmount, 18).toString(),
    destination: propertyAddress,
  })
  console.log({ estimatedEth })
  return { estimatedEth, create }
}

export const tokenURISim = async (
  prov: providers.BaseProvider,
  propertyAddress: string,
  amount: number | string
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.tokenURISim({
    positions: {
      amount: utils.parseUnits(amount.toString(), 18).toString(),
      property: propertyAddress,
    },
  })
}
