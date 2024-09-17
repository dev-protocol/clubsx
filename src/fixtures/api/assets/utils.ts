import {
  isNotError,
  type ErrorOr,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import { Contract, type InterfaceAbi, type Provider } from 'ethers'
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
  type AssetContractType,
  type AssetDocument,
  type LogDocument,
} from '@fixtures/api/assets/schema'
import { always, tryCatch } from 'ramda'

const BLOCK_SIZE = 5000000

export const ABI_NFT = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function tokenURI(uint256) view returns(string)',
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
  const block = blockFromDb
  console.log({ fromDB, blockFromDb })
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
  abi,
  contractType,
  assetTypeAndPayloadFetcher,
  propertyAddressFetcher,
}: {
  provider: Provider
  redis: AsyncReturnType<typeof getDefaultClient>
  contractAddress: string
  abi: InterfaceAbi
  contractType: AssetContractType
  assetTypeAndPayloadFetcher: (
    type: AssetContractType,
    id?: string,
    contract?: Contract,
    client?: AsyncReturnType<typeof getDefaultClient>,
  ) => Promise<{
    assetType: AssetDocument['type']
    assetPayload: string | undefined
  }>
  propertyAddressFetcher?: (
    contract: Contract,
    id: string,
  ) => Promise<string | undefined>
}) => {
  const [fromBlockDb, latestBlock] = await Promise.all([
    lastBlock(contractAddress, redis),
    provider.getBlockNumber(),
  ])

  const fromBlock = fromBlockDb ?? latestBlock - BLOCK_SIZE

  const toBlock = whenNotError(fromBlock, (block) =>
    ((v) => (v < latestBlock ? v : latestBlock))(block + BLOCK_SIZE),
  )

  console.log({ contract, fromBlockDb, fromBlock })

  const nft = whenNotError(
    provider,
    (prov) => new Contract(contractAddress, abi, prov),
  )

  const transferEvents = await whenNotErrorAll(
    [nft, fromBlock, toBlock],
    ([tokens, from, to]) =>
      whenDefinedAll([tokens, from, to], async ([_nft, _from, _to]) => {
        const event = _nft.filters.Transfer()
        const logs = await _nft
          .queryFilter(event, _from, _to)
          .catch((err: Error) => err)
        const sorted = whenNotError(logs, (_logs) =>
          _logs.sort((a, b) => a.index - b.index),
        )
        const res = whenNotError(sorted, (_sorted) =>
          _sorted.map((log) => {
            const decoded = tryCatch(
              (_log: typeof log) =>
                _nft.interface.decodeEventLog('Transfer', log.data, log.topics),
              (err: Error) => err,
            )(log)
            const g = whenNotError(decoded, ([from, to, id]) => ({
              from,
              to,
              id,
            }))
            const data = whenNotError(
              g,
              ({ from, to, id }) =>
                ({
                  from,
                  to,
                  id,
                  block: log.blockNumber,
                  propertyAddress: undefined,
                }) satisfies {
                  from: string
                  to: string
                  id: string
                  block: number
                  propertyAddress: undefined
                },
            )
            return data
          }),
        )
        return res
      }) ?? new Error('Failed to fetch NFT transfer events'),
  )

  const withProperties = await whenNotErrorAll(
    [nft, transferEvents],
    ([_nft, evs]) =>
      whenDefinedAll([evs, propertyAddressFetcher], ([dataList, fetcher]) =>
        Promise.all(
          dataList.filter(isNotError).map(async (ev) => {
            const propertyAddress = await tryCatch(
              (id: string) => fetcher(_nft, id),
              always(undefined),
            )(ev.id)
            return { ...ev, propertyAddress }
          }),
        ),
      ) ?? evs,
  )

  const assetDocs = await whenNotErrorAll(
    [nft, withProperties],
    ([_nft, events]) =>
      Promise.all(
        events
          .filter(isNotError)
          .map(async ({ id, to: owner, block, propertyAddress }) => {
            const assetTypeAndPayload = await assetTypeAndPayloadFetcher(
              contractType,
              id,
              _nft,
              redis,
            )
            const doc = assetDocument({
              type: assetTypeAndPayload.assetType,
              contract: contractAddress,
              id,
              owner,
              block,
              balance: '1',
              propertyAddress,
              payload: assetTypeAndPayload.assetPayload,
            })
            return doc
          }),
      ),
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
