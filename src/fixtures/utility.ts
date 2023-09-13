import BigNumber from 'bignumber.js'
import {
  BrowserProvider,
  type ContractRunner,
  JsonRpcProvider,
  formatEther,
  keccak256,
  parseEther,
} from 'ethers'
import type { Tiers } from '@constants/tier'
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
  provider: ContractRunner
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
    opts.owner,
  )
  const image = res ? validImageUri(res.image) : (undefined as never)
  return { ...res, image }
}

export const fetchEthForDev = async (opts: {
  provider: ContractRunner
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
  provider: ContractRunner
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
  provider: ContractRunner
  tokenAddress: string
}): Promise<{ dev: Tiers; eth: Tiers }> => {
  const forDev = await Promise.all(
    sourceTiers.map(async ({ ...tier }) => {
      const badgeImageSrc =
        tier.badgeImageSrc ??
        (
          await fetchSTokens({
            provider,
            tokenAddress,
            amount: tier.amount,
          })
        ).image
      return { ...tier, badgeImageSrc }
    }),
  )
  const forEth = await Promise.all(
    forDev.map(async ({ ...tier }) => {
      const amount = await fetchEthForDev({
        provider,
        tokenAddress,
        amount: tier.amount,
      })
      return { ...tier, amount: formatEther(amount) }
    }),
  )
  return {
    dev: forDev,
    eth: forEth,
  }
}

export const checkMemberships = async (
  provider: BrowserProvider | JsonRpcProvider,
  propertyAddress: string,
  requiredMemberships: Membership[],
  userAddress: string = '0x0000000000000000000000000000000000000000',
) => {
  console.log({ propertyAddress, requiredMemberships })

  // Check if we are validating at server or ui. because server can
  // provide userAddress.
  if (userAddress === '0x0000000000000000000000000000000000000000') {
    // gets the visitor's address
    const signer = await provider.getSigner()
    userAddress = await signer.getAddress()
  }

  // creates sTokens detector
  const clients = await clientsSTokens(provider)
  const contract = whenDefined(clients, ([l1, l2]) => l1 ?? l2)
  if (!contract) return false

  const detectSTokens = whenDefined(contract, client.createDetectSTokens)

  // gets all sTokens of the passed Property address that the visitor have
  const allSTokens = await whenDefined(detectSTokens, (detector) =>
    detector(propertyAddress, userAddress),
  )
  if (!allSTokens) return false
  console.log({ allSTokens })

  // https://ramdajs.com/docs/#xprod
  const pairs = xprod(requiredMemberships, allSTokens)

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any
  const testResult = await Promise.any(
    pairs.map(async ([membership, tokenId]) => {
      const payload = whenDefined(membership.payload, keccak256)

      const sTokenContract = contract.contract()
      // if it has payload, test the payload
      const testForPayload = await whenDefined(
        payload,
        async (v) => (await sTokenContract.payloadOf(tokenId)) === v,
      )

      // if it has not payload, test the staking amount
      // This works for only direct DEV staking
      const testForAmount =
        payload && membership.currency === 'DEV'
          ? undefined
          : BigInt((await contract.positions(tokenId)).amount) >
            BigInt(parseEther(membership.price.toString()))

      if (testForPayload || testForAmount) {
        return tokenId
      }

      return Promise.reject('Membership not found')
    }),
  )

  // returns the result
  return testResult > 0
}

export const cleanImport = async <T>(module: string): Promise<T> =>
  import(`${module}?${Date.now()}`)
