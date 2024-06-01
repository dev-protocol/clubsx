import {
  isNotError,
  type ErrorOr,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import { Contract, type ContractRunner, type Provider } from 'ethers'
import {
  getDefaultClient,
  Index,
  generateAssetKey,
  generateLogKey,
} from '@fixtures/api/assets/redis'
import type { AsyncReturnType } from 'type-fest'
import {
  assetDocument,
  contract,
  type AssetDocument,
  type LogDocument,
} from '@fixtures/api/assets/schema'

const BLOCK_SIZE = 5000000

const ABI_NFT = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]

const lastBlock = async (
  contractAddress: string,
  client: AsyncReturnType<typeof getDefaultClient>,
) => {
  const fromDB = await client.ft
    .search(Index.Log, `@${contract['$.contract'].AS}:{${contractAddress}}`, {
      LIMIT: { from: 0, size: 1 },
    })
    .catch((err: Error) => err)
  const blockFromDb = isNotError(fromDB)
    ? (fromDB.documents[0]?.value?.nBlock as UndefinedOr<number>)
    : undefined
  const block = blockFromDb ?? 0
  return block
  // return 19000000
}

/**
 * CRON job to fetch all assets and record them in the database
 * @returns
 */
export const fetchAssets = async ({
  provider,
  redis,
  contractAddress,
  type,
}: {
  provider: Provider
  redis: AsyncReturnType<typeof getDefaultClient>
  contractAddress: string
  type: AssetDocument['type']
}) => {
  const [fromBlock, latestBlock] = await Promise.all([
    lastBlock(contractAddress, redis),
    provider.getBlockNumber(),
  ])

  const toBlock = whenNotError(fromBlock, (block) =>
    ((v) => (v < latestBlock ? v : latestBlock))(block + BLOCK_SIZE),
  )

  console.log({ contract, fromBlock })

  const nft = whenNotError(
    provider,
    (prov) => new Contract(contractAddress, ABI_NFT, prov),
  )

  const transferEvents = await whenNotErrorAll(
    [nft, fromBlock, toBlock],
    ([tokens, from, to]) =>
      whenDefinedAll([tokens, from, to], async ([_nft, _from, _to]) => {
        const event = _nft.filters.Transfer()
        const logs = await _nft.queryFilter(event, _from, _to)
        const sorted = logs.sort((a, b) => a.index - b.index)
        const res = sorted.map((log) => {
          const [from, to, id] = _nft.interface.decodeEventLog(
            'Transfer',
            log.data,
            log.topics,
          )
          const data = {
            from,
            to,
            id,
            block: log.blockNumber,
          } as {
            from: string
            to: string
            id: string
            block: number
          }
          return data
        })
        return res
      }) ?? new Error('Failed to fetch NFT transfer events'),
  )

  const assetDocs = whenNotError(transferEvents, (events) =>
    events.map(({ id, to: owner, block }) => {
      const doc = assetDocument({
        type,
        contract: contractAddress,
        id,
        owner,
        block,
        balance: '1',
      })
      return doc
    }),
  )

  console.log({ contractAddress, assetDocs })

  const logDoc: ErrorOr<LogDocument> = whenNotError(toBlock, (block) => ({
    contract: contractAddress,
    block: block.toString(),
    nBlock: block,
  }))
  console.log({ contractAddress, logDoc })

  await whenNotErrorAll([assetDocs, logDoc], ([_assetDocs, _logDoc]) =>
    Promise.all([
      ..._assetDocs.map((doc) =>
        redis.json.set(generateAssetKey(contractAddress, doc.id), '$', doc),
      ),
      redis.json.set(generateLogKey(contractAddress), '$', _logDoc),
    ]),
  )

  console.log(
    '@@@@',
    await redis.ft.search(Index.Asset, `@contract:{${contractAddress}}`, {
      LIMIT: { from: 0, size: 10 },
    }),
  )

  return assetDocs
}
