import { providers } from 'ethers'
import {
  contractFactory,
  DevkitContract,
  addresses,
} from '@devprotocol/dev-kit'
import {
  contractFactory as l2ContractFactory,
  DevkitContract as L2DevkitContract,
} from '@devprotocol/dev-kit/l2'
import { UndefinedOr } from '@devprotocol/util-ts'

export type ChainName = UndefinedOr<
  | 'ethereum'
  | 'ropsten'
  | 'arbitrum-one'
  | 'arbitrum-rinkeby'
  | 'polygon'
  | 'polygon-mumbai'
>

const newClient = async (
  prov: providers.BaseProvider
): Promise<
  [
    UndefinedOr<DevkitContract>,
    UndefinedOr<L2DevkitContract>,
    UndefinedOr<DevkitContract | L2DevkitContract>
  ]
> => {
  const isL2 = await getNetwork(prov).then(
    (name) => name !== 'ethereum' && name !== 'ropsten'
  )
  const contracts = !isL2 ? contractFactory(prov) : undefined
  const l2Contracts = isL2 ? l2ContractFactory(prov) : undefined
  return [contracts, l2Contracts, contracts || l2Contracts]
}

const getNetwork = async (prov: providers.BaseProvider) => {
  const net = await detectChain(prov)
  return net.name
}

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

const getSTokensAddress = async (prov: providers.BaseProvider) => {
  const net = await getNetwork(prov)
  return net === 'ethereum'
    ? addresses.eth.main.sTokens
    : net === 'ropsten'
    ? addresses.eth.ropsten.sTokens
    : net === 'arbitrum-one'
    ? addresses.arbitrum.one.sTokens
    : net === 'arbitrum-rinkeby'
    ? addresses.arbitrum.rinkeby.sTokens
    : net === 'polygon'
    ? addresses.polygon.mainnet.sTokens
    : net === 'polygon-mumbai'
    ? addresses.polygon.mumbai.sTokens
    : undefined
}

export const getStokenPositions = async (
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [, , client] = await newClient(prov)
  const address = await getSTokensAddress(prov)
  if (client && address) {
    return client.sTokens(address).positions(sTokenID)
  }
  return undefined
}

export const getStokenOwnerOf = async (
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [, , client] = await newClient(prov)
  const address = await getSTokensAddress(prov)
  if (client && address) {
    return client.sTokens(address).ownerOf(sTokenID)
  }
  return undefined
}

export const getStokenTokenURI = async (
  prov: providers.BaseProvider,
  sTokenID: number
) => {
  const [, , client] = await newClient(prov)
  const address = await getSTokensAddress(prov)
  if (client && address) {
    return client.sTokens(address).tokenURI(sTokenID)
  }
  return undefined
}

export const detectStokensByPropertyAddress = async (
  prov: providers.BaseProvider,
  propertyAddress: string
) => {
  const [, , client] = await newClient(prov)
  const address = await getSTokensAddress(prov)
  if (client && address) {
    const TokenIdList = await (
      client.sTokens(address) as any
    ).positionsOfProperty(propertyAddress)
    return TokenIdList
  }
  return undefined
}

export const balanceOfProperty = async (
  prov: providers.BaseProvider,
  propertyAddress: string,
  accountAddress: string
) => {
  const [, , client] = await newClient(prov)
  if (client && accountAddress) {
    return client.property(propertyAddress).balanceOf(accountAddress)
  }
  return undefined
}
