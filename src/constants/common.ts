import { addresses } from '@devprotocol/dev-kit'
import { ZeroAddress } from 'ethers'

export type TokenInfoByChainId = {
  [chainId: string]: {
    name: string
    decimals: number
    address: string
    coingeckoCurrencyId: string
  }
}

export type TokenInfo = {
  [tokenSymbol: string]: TokenInfoByChainId
}

export const tokenInfo: TokenInfo = {
  USDC: {
    137: {
      name: 'USDC',
      decimals: 6,
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      coingeckoCurrencyId: 'usd-coin',
    },
    80001: {
      name: 'USDC',
      decimals: 6,
      address: '0xFEca406dA9727A25E71e732F9961F680059eF1F9',
      coingeckoCurrencyId: 'usd-coin',
    },
  },
  DEV: {
    137: {
      name: 'DEV',
      decimals: 18,
      address: addresses.polygon.mainnet.token,
      coingeckoCurrencyId: 'dev-protocol',
    },
    80001: {
      name: 'DEV',
      decimals: 18,
      address: addresses.polygon.mumbai.token,
      coingeckoCurrencyId: 'dev-protocol',
    },
  },
  ETH: {
    137: {
      name: 'ETH',
      decimals: 18,
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      coingeckoCurrencyId: 'ethereum',
    },
    80001: {
      name: 'ETH',
      decimals: 18,
      address: '0x3c8d6A6420C922c88577352983aFFdf7b0F977cA', // NOTE: this is devWETH
      coingeckoCurrencyId: 'ethereum',
    },
  },
  MATIC: {
    137: {
      name: 'MATIC',
      decimals: 18,
      address: ZeroAddress,
      coingeckoCurrencyId: 'polygon-network',
    },
    80001: {
      name: 'MATIC',
      decimals: 18,
      address: ZeroAddress,
      coingeckoCurrencyId: 'matic-network',
    },
  },
}
