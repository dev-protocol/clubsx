import { constants, providers, utils } from 'ethers'
import {
  positionsCreateWithEth,
  positionsCreateWithEthForPolygon,
  clientsSTokens,
  clientsProperty,
  clientsLockup,
} from '@devprotocol/dev-kit/agent'
import { UndefinedOr, whenDefined } from '@devprotocol/util-ts'
import { positionsCreate } from '@devprotocol/dev-kit'

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
  if (propertyAddress === constants.AddressZero) {
    return undefined
  }
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.positionsOfProperty(propertyAddress)
}

export const balanceOfProperty = async (
  prov: providers.BaseProvider,
  propertyAddress: string,
  accountAddress: string
) => {
  if (propertyAddress === constants.AddressZero) {
    return undefined
  }
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
  if (propertyAddress === constants.AddressZero) {
    return undefined
  }
  // only for L2
  const [, l2] = await clientsProperty(prov, propertyAddress)
  return l2?.getBalances()
}

export const stake = async (
  provider: providers.BaseProvider,
  propertyAddress: string,
  from: string,
  devAmount: number | string
) => {
  const amount = utils.parseUnits(devAmount.toString(), 18).toString()
  const res = await positionsCreate({
    provider,
    from,
    amount,
    destination: propertyAddress,
  })
  return res
}

export const stakeWithEth = async ({
  provider,
  propertyAddress,
  devAmount,
  ethAmount,
  payload,
  gatewayAddress,
  gatewayBasisPoints,
}: {
  provider: providers.BaseProvider
  propertyAddress: string
  devAmount?: string
  ethAmount?: string
  payload?: string
  gatewayAddress?: string
  gatewayBasisPoints?: number // For example 10000 is 100%
}) => {
  const { estimatedEth, estimatedDev, create } = await positionsCreateWithEth({
    provider,
    devAmount: whenDefined(devAmount, (dev) =>
      utils.parseUnits(dev, 18).toString()
    ),
    ethAmount: whenDefined(ethAmount, (eth) =>
      utils.parseUnits(eth, 18).toString()
    ),
    destination: propertyAddress,
    payload,
    gatewayAddress,
    gatewayBasisPoints,
  })
  console.log({ estimatedEth, estimatedDev })
  return { estimatedEth, estimatedDev, create }
}

export const stakeWithEthForPolygon = async (
  {
    provider,
    propertyAddress,
    devAmount,
    ethAmount,
    payload,
    from,
    gatewayAddress,
    gatewayBasisPoints,
  }: {
    provider: providers.BaseProvider
    propertyAddress: string
    devAmount?: string
    ethAmount?: string
    payload?: string
    from?: string
    gatewayAddress?: string
    gatewayBasisPoints?: number
  } // For example 10000 is 100%
) => {
  const { estimatedEth, estimatedDev, create } =
    await positionsCreateWithEthForPolygon({
      provider,
      devAmount: whenDefined(devAmount, (dev) =>
        utils.parseUnits(dev, 18).toString()
      ),
      ethAmount: whenDefined(ethAmount, (eth) =>
        utils.parseUnits(eth, 18).toString()
      ),
      destination: propertyAddress,
      payload,
      gatewayAddress,
      gatewayBasisPoints,
      from,
    })
  console.log({ estimatedEth, estimatedDev })
  return { estimatedEth, estimatedDev, create }
}

export const tokenURISim = async (
  prov: providers.BaseProvider,
  propertyAddress: string,
  amount?: number | string,
  payload?: string | Uint8Array,
  owner?: string
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.tokenURISim({
    positions: {
      amount: whenDefined(amount, (x) =>
        utils.parseUnits(x.toString(), 18).toString()
      ),
      property: propertyAddress,
    },
    payload,
    owner,
  })
}

export const calculateRewardAmount = async (
  prov: providers.BaseProvider,
  propertyAddress: string
) => {
  const [l1, l2] = await clientsLockup(prov)
  return (l1 || l2)?.calculateRewardAmount(propertyAddress)
}

export const propertySymbol = async (
  prov: providers.BaseProvider,
  propertyAddress: string
) => {
  if (propertyAddress === constants.AddressZero) {
    return undefined
  }
  const [l1, l2] = await clientsProperty(prov, propertyAddress)
  return (l1 || l2)?.symbol()
}
