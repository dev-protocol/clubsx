import {
  whenDefined,
  type UndefinedOr,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import {
  ZeroAddress,
  type ContractRunner,
  type EventLog,
  type Log,
} from 'ethers'
import { clientsSTokens } from '@devprotocol/dev-kit'
import type dayjs from 'dayjs'
import { create } from './date'

const LOOP_BLOCK_SIZE = 50000000

type EventLogs = (EventLog | Log)[]

export const getMintedAt = async (options: {
  tokenId: number | string
  provider: ContractRunner
}): Promise<UndefinedOr<dayjs.Dayjs>> => {
  const [c1, c2] = await clientsSTokens(options.provider)
  const sTokens = c1 ?? c2
  const initialTransfer = whenDefined(sTokens, (clt) =>
    clt.contract().filters.Transfer(ZeroAddress, undefined, options.tokenId),
  )
  const latest = await options.provider.provider?.getBlockNumber()
  const loopCount = whenDefined(
    latest,
    (_latest) => ~~(_latest / LOOP_BLOCK_SIZE) + 1,
  )
  const logQueries = whenDefinedAll(
    [latest, loopCount, sTokens, initialTransfer],
    ([latestBlock, count, clt, ev]) =>
      new Array(count).fill(null).map((_, i) => {
        const fromBlock = i * LOOP_BLOCK_SIZE
        const toBlock = ((num) => (num > latestBlock ? latest : num))(
          fromBlock + LOOP_BLOCK_SIZE - 1,
        )
        return clt.contract().queryFilter(ev, fromBlock, toBlock)
      }),
  )

  const logs = await whenDefined(logQueries, (queries) =>
    Promise.race(
      queries.map(
        (query) =>
          new Promise<EventLogs>(async (resolve) => {
            const res = await query
            if (res.length > 0) {
              resolve(res)
            }
          }),
      ),
    ),
  )
  const blockNumber = whenDefined(logs, (log) => log[0].blockNumber)
  const block = await whenDefined(
    blockNumber,
    (block) => options.provider.provider?.getBlock(block),
  )
  const timestampMs = whenDefined(block, ({ timestamp }) => timestamp * 1000)

  return whenDefined(timestampMs, (ts) => create(new Date(ts)).utc())
}
