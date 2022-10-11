import { BaseProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { ethers, utils } from 'ethers'
import type { Tiers } from '@constants/tier'
import { stakeWithEth, stakeWithEthForPolygon, tokenURISim } from './dev-kit'
import { clientsSTokens, client } from '@devprotocol/dev-kit'
import { whenDefined } from '@devprotocol/util-ts'
import { xprod } from 'ramda'

import { GatedMessageRequiredMemberships } from '../plugins/message/types'

const falsyOrZero = <T>(num?: T): T | 0 => (num ? num : 0)

const toNaturalBasis = new BigNumber(10).pow(18)

export const toNaturalNumber = (num?: number | string | BigNumber): BigNumber =>
  new BigNumber(falsyOrZero(num)).div(toNaturalBasis)

export const validImageUri = (path: string) => {
  const src = path.startsWith('ipfs://')
    ? path.replace(/^ipfs:\/\/(.*)/, 'https://$1.ipfs.nftstorage.link/')
    : path
  return src
}

export const fetchBadgeImageSrc = async (opts: {
  provider: BaseProvider
  tokenAddress: string
  amount: number | string
}) => {
  const res = await tokenURISim(opts.provider, opts.tokenAddress, opts.amount)
  const src = res ? validImageUri(res.image) : undefined
  return src
}

export const fetchEthForDev = async (opts: {
  provider: BaseProvider
  tokenAddress: string
  amount: number | string
}) => {
  const { estimatedEth } = await stakeWithEth({
    provider: opts.provider,
    propertyAddress: opts.tokenAddress,
    devAmount: new BigNumber(opts.amount).toFixed(),
  })
  return estimatedEth
}

export const fetchDevForEth = async (opts: {
  provider: BaseProvider
  tokenAddress: string
  amount: number | string
  chain?: number
}) => {
  const params = {
    provider: opts.provider,
    propertyAddress: opts.tokenAddress,
    ethAmount: new BigNumber(opts.amount).toFixed(),
  }
  const { estimatedDev } =
    opts.chain === 137 || opts.chain === 80001
      ? await stakeWithEthForPolygon(params)
      : await stakeWithEth(params)
  return estimatedDev
}

export const composeTiers = async ({
  sourceTiers,
  provider,
  tokenAddress,
}: {
  sourceTiers: Tiers
  provider: BaseProvider
  tokenAddress: string
}): Promise<{ dev: Tiers; eth: Tiers }> => {
  const forDev = await Promise.all(
    sourceTiers.map(async ({ ...tier }) => {
      const badgeImageSrc =
        tier.badgeImageSrc ??
        (await fetchBadgeImageSrc({
          provider,
          tokenAddress,
          amount: tier.amount,
        }))
      return { ...tier, badgeImageSrc }
    })
  )
  const forEth = await Promise.all(
    forDev.map(async ({ ...tier }) => {
      const amount = await fetchEthForDev({
        provider,
        tokenAddress,
        amount: tier.amount,
      })
      return { ...tier, amount: utils.formatEther(amount) }
    })
  )
  return {
    dev: forDev,
    eth: forEth,
  }
}

export const checkMemberships = async (
  provider: ethers.providers.Web3Provider,
  propertyAddress: string,
  requiredMemberships: GatedMessageRequiredMemberships[]
) => {
  // gets the visitor's address
  const signer = provider.getSigner()
  const userAddress = await signer.getAddress()

  // creates sTokens detector
  const clients = await clientsSTokens(provider)
  const contract = whenDefined(clients, ([l1, l2]) => l1 ?? l2)
  if (!contract) return false

  const detectSTokens = whenDefined(contract, client.createDetectSTokens)

  // gets all sTokens of the passed Property address that the visitor have
  const allSTokens = await whenDefined(detectSTokens, (detector) =>
    detector(propertyAddress, userAddress)
  )
  if (!allSTokens) return false

  // https://ramdajs.com/docs/#xprod
  const pairs = xprod(requiredMemberships, allSTokens)

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any
  const testResult = await Promise.any(
    pairs.map(async ([membership, tokenId]) => {
      const payload = whenDefined(membership.payload, utils.keccak256)

      const sTokenContract = contract.contract()
      // if it has payload, test the payload
      const testForPayload = await whenDefined(
        payload,
        async (v) => (await sTokenContract.payloadOf(tokenId)) === v
      )

      // if it has not payload, test the staking amount
      const testForAmount = payload
        ? undefined
        : ethers.BigNumber.from((await contract.positions(tokenId)).amount).gte(
            utils.parseEther(membership.amount.toString())
          )

      if (testForPayload || testForAmount) {
        return tokenId
      }

      return Promise.reject()
    })
  )

  // returns the result
  return testResult > 0
}
