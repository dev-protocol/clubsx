import type { BaseProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { ethers, utils } from 'ethers'
import { stakeWithEth, stakeWithEthForPolygon, tokenURISim } from './dev-kit'
import { clientsSTokens, client } from '@devprotocol/dev-kit'
import { whenDefined } from '@devprotocol/util-ts'
import { xprod } from 'ramda'

import type { Membership } from '@plugins/memberships'

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

export const fetchSTokens = async (opts: {
  provider: BaseProvider
  tokenAddress: string
  amount?: number | string
  payload?: string | Uint8Array
  owner?: string
}) => {
  const res = await tokenURISim(
    opts.provider,
    opts.tokenAddress,
    opts.amount,
    opts.payload,
    opts.owner
  )
  const image = res ? validImageUri(res.image) : (undefined as never)
  return { ...res, image }
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
  sourceTiers: Membership[]
  provider: BaseProvider
  tokenAddress: string
}): Promise<{ dev: Membership[]; eth: Membership[] }> => {
  const onlyDev = sourceTiers.filter((mem) => mem.currency === 'DEV')
  const onlyEth = sourceTiers.filter((mem) => mem.currency === 'ETH')
  const [ethFromDev, devFromEth] = await Promise.all([
    Promise.all(
      onlyDev.map(async ({ ...mem }): Promise<Membership> => {
        const price = await fetchEthForDev({
          provider,
          tokenAddress,
          amount: mem.price,
        })
        return { ...mem, price: utils.formatEther(price), currency: 'ETH' }
      })
    ),
    Promise.all(
      onlyEth.map(async ({ ...mem }): Promise<Membership> => {
        const price = await fetchDevForEth({
          provider,
          tokenAddress,
          amount: mem.price,
        })
        return { ...mem, price: utils.formatEther(price), currency: 'DEV' }
      })
    ),
  ])

  return {
    dev: [...onlyDev, ...devFromEth],
    eth: [...onlyEth, ...ethFromDev],
  }
}

export const checkMemberships = async (
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
  propertyAddress: string,
  requiredMemberships: Membership[],
  userAddress: string = '0x0000000000000000000000000000000000000000'
) => {
  console.log({ propertyAddress, requiredMemberships })

  // Check if we are validating at server or ui. because server can
  // provide userAddress.
  if (userAddress === '0x0000000000000000000000000000000000000000') {
    // gets the visitor's address
    const signer = provider.getSigner()
    userAddress = await signer.getAddress()
  }

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
  console.log({ allSTokens })

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
      // This works for only direct DEV staking
      const testForAmount =
        payload && membership.currency === 'DEV'
          ? undefined
          : ethers.BigNumber.from(
              (await contract.positions(tokenId)).amount
            ).gte(utils.parseEther(membership.price.toString()))

      if (testForPayload || testForAmount) {
        return tokenId
      }

      return Promise.reject('Membership not found')
    })
  )

  // returns the result
  return testResult > 0
}
