import { BaseProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { utils } from 'ethers'
import type { Tiers } from 'src/constants/tier'
import { stakeWithEth } from './dev-kit'

const falsyOrZero = <T>(num?: T): T | 0 => (num ? num : 0)

const toNaturalBasis = new BigNumber(10).pow(18)

export const toNaturalNumber = (num?: number | string | BigNumber): BigNumber =>
  new BigNumber(falsyOrZero(num)).div(toNaturalBasis)

export const convertTiersToEth = async (opts: {
  sourceTiers: Tiers
  provider: BaseProvider
  tokenAddress: string
}): Promise<Tiers> => {
  return Promise.all(
    [...opts.sourceTiers].map(async ({ ...tier }) => {
      const { estimatedEth } = await stakeWithEth(
        opts.provider,
        opts.tokenAddress,
        new BigNumber(tier.amount).toFixed()
      )
      return {
        ...tier,
        amount: utils.formatEther(estimatedEth),
      }
    })
  )
}
