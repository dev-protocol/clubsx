import {
  BrowserProvider,
  ContractRunner,
  JsonRpcProvider,
  ZeroAddress,
  parseUnits,
} from 'ethers'
import {
  positionsCreateWithEth,
  positionsCreateWithEthForPolygon,
  clientsSTokens,
  clientsProperty,
  clientsLockup,
  positionsCreateWithAnyTokens,
} from '@devprotocol/dev-kit/agent'
import { UndefinedOr, whenDefined } from '@devprotocol/util-ts'
import { positionsCreate } from '@devprotocol/dev-kit'
import { CurrencyOption } from '@constants/currencyOption'

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

export const stakeWithEth = async ({
  provider,
  propertyAddress,
  devAmount,
  ethAmount,
  payload,
  gatewayAddress,
  gatewayBasisPoints,
}: {
  provider: ContractRunner
  propertyAddress: string
  devAmount?: string
  ethAmount?: string
  payload?: string
  gatewayAddress?: string
  gatewayBasisPoints?: number // For example 10000 is 100%
}) => {
  const { estimatedEth, estimatedDev, create } = await positionsCreateWithEth({
    provider,
    devAmount: whenDefined(devAmount, (dev) => parseUnits(dev, 18).toString()),
    ethAmount: whenDefined(ethAmount, (eth) => parseUnits(eth, 18).toString()),
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
    provider: ContractRunner
    propertyAddress: string
    devAmount?: string
    ethAmount?: string
    payload?: string
    from?: string
    gatewayAddress?: string
    gatewayBasisPoints?: number
  }, // For example 10000 is 100%
) => {
  const { estimatedEth, estimatedDev, create } =
    await positionsCreateWithEthForPolygon({
      provider,
      devAmount: whenDefined(devAmount, (dev) =>
        parseUnits(dev, 18).toString(),
      ),
      ethAmount: whenDefined(ethAmount, (eth) =>
        parseUnits(eth, 18).toString(),
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
  prov: ContractRunner,
  propertyAddress: string,
  amount?: number | string,
  payload?: string | Uint8Array,
  owner?: string,
) => {
  const [l1, l2] = await clientsSTokens(prov)
  return (l1 || l2)?.tokenURISim({
    positions: {
      amount: whenDefined(amount, (x) =>
        parseUnits(x.toString(), 18).toString(),
      ),
      property: propertyAddress,
    },
    payload,
    owner,
  })
}

export const calculateRewardAmount = async (
  prov: ContractRunner,
  propertyAddress: string,
) => {
  const [l1, l2] = await clientsLockup(prov)
  return (l1 || l2)?.calculateRewardAmount(propertyAddress)
}

export const stakeWithAnyTokens = async (
  {
    provider,
    propertyAddress,
    tokenAmount,
    tokenDecimals,
    payload,
    from,
    gatewayAddress,
    gatewayBasisPoints,
    mintTo,
    currency,
    chain: _chain,
  }: {
    provider: JsonRpcProvider
    propertyAddress: string
    tokenAmount?: string
    tokenDecimals?: number
    payload?: string
    from?: string
    gatewayAddress?: string
    gatewayBasisPoints?: number
    mintTo?: string
    currency: CurrencyOption
    chain?: number
  }, // For example 10000 is 100%
) => {
  const chain =
    typeof _chain === 'number'
      ? _chain
      : Number((await provider.getNetwork()).chainId)
  const path =
    currency === CurrencyOption.USDC && chain === 137
      ? [
          '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
          500n,
          '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
          10000n,
          '0xA5577D1cec2583058A6Bd6d5DEAC44797c205701', // DEV
        ]
      : currency === CurrencyOption.USDC && chain === 80001
      ? [
          '0xFEca406dA9727A25E71e732F9961F680059eF1F9', // USDC
          10000n,
          '0x3c8d6A6420C922c88577352983aFFdf7b0F977cA', // devWETH
          10000n,
          '0xcbc698ed514dF6e54932a22515d6D0C27E4DA091', // DEV
        ]
      : []
  const token =
    currency === CurrencyOption.USDC && chain === 137
      ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      : currency === CurrencyOption.USDC && chain === 80001
      ? '0xFEca406dA9727A25E71e732F9961F680059eF1F9'
      : ZeroAddress
  return positionsCreateWithAnyTokens({
    mintTo: mintTo ?? ZeroAddress,
    token,
    path,
    provider,
    tokenAmount: whenDefined(tokenAmount, (token) =>
      parseUnits(token, tokenDecimals ?? 18).toString(),
    ),
    destination: propertyAddress,
    payload,
    gatewayAddress,
    gatewayBasisPoints,
    from,
  })
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
