import BigNumber from 'bignumber.js'

const falsyOrZero = <T>(num?: T): T | 0 => (num ? num : 0)

const toNaturalBasis = new BigNumber(10).pow(18)

export const toNaturalNumber = (num?: number | string | BigNumber): BigNumber =>
  new BigNumber(falsyOrZero(num)).div(toNaturalBasis)
