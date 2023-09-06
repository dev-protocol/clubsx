import { ZeroAddress } from 'ethers'

export type TokenInfoByChainId = {
  [chainId: string]: {
    name: string
    decimals: number
    address: string
  }
}

export type TokenInfo = {
  [tokenSymbol: string]: TokenInfoByChainId
}

export const tokenInfo: TokenInfo = {
  USDC: {
    80001: {
      name: 'USDC',
      decimals: 6,
      address: '0xFEca406dA9727A25E71e732F9961F680059eF1F9', // TODO: change this.
    },
  },
  DEV: {
    80001: {
      name: 'DEV',
      decimals: 18,
      address: '0xcbc698ed514dF6e54932a22515d6D0C27E4DA091', // TODO: change this.
    },
  },
  ETH: {
    80001: {
      name: 'ETH',
      decimals: 18,
      address: '0x3c8d6A6420C922c88577352983aFFdf7b0F977cA', // NOTE: this is devWETH
    },
  },
  MATIC: {
    137: {
      name: 'MATIC',
      decimals: 18,
      address: ZeroAddress,
    },
    80001: {
      name: 'MATIC',
      decimals: 18,
      address: ZeroAddress,
    },
  },
}
