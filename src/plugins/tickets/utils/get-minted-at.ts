import {
  whenDefined,
  type UndefinedOr,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import { ZeroAddress, type ContractRunner } from 'ethers'
import { clientsSTokens } from '@devprotocol/dev-kit'
import type dayjs from 'dayjs'
import { create } from './date'

export const getMintedAt = async (options: {
  tokenId: number | string
  provider: ContractRunner
}): Promise<UndefinedOr<dayjs.Dayjs>> => {
  const [c1, c2] = await clientsSTokens(options.provider)
  const sTokens = c1 ?? c2
  const initialTransfer = whenDefined(sTokens, (clt) =>
    clt.contract().filters.Transfer(ZeroAddress, undefined, options.tokenId),
  )
  const logs = await whenDefinedAll([sTokens, initialTransfer], ([clt, ev]) =>
    clt.contract().queryFilter(ev),
  )
  const blockNumber = whenDefined(logs, (log) => log[0].blockNumber)
  const block = await whenDefined(
    blockNumber,
    (block) => options.provider.provider?.getBlock(block),
  )
  const timestampMs = whenDefined(block, ({ timestamp }) => timestamp * 1000)

  return whenDefined(timestampMs, (ts) => create(new Date(ts)).utc())
}
