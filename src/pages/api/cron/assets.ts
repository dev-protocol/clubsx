import { cache, headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'
import {
  isNotError,
  whenDefined,
  type ErrorOr,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import { JsonRpcProvider } from 'ethers'
import {
  getDefaultClient,
  Index,
  generateAssetKey,
  generateLogKey,
} from '@fixtures/api/assets/redis'
import { addresses, clientsSTokens } from '@devprotocol/dev-kit'
import { json } from '@fixtures/api/json'
import type { AsyncReturnType } from 'type-fest'
import {
  assetDocument,
  contract,
  type LogDocument,
} from '@fixtures/api/assets/schema'

const { PUBLIC_INFURA_KEY } = import.meta.env

const BLOCK_SIZE = 5000000

export const maxDuration = 30

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
export const GET: APIRoute = async () => {
  const provider =
    whenDefined(
      PUBLIC_INFURA_KEY,
      (key) =>
        new JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${key}`),
    ) ?? new Error('INFURA key not found')

  const client = await getDefaultClient()

  const sTokensFromBlock = await lastBlock(
    addresses.polygon.mainnet.sTokens,
    client,
  )

  const sTokensToBlock = whenNotError(
    sTokensFromBlock,
    (block) => block + BLOCK_SIZE,
  )

  console.log({ sTokensFromBlock })

  const sTokens = await whenNotError(provider, (prov) =>
    clientsSTokens(prov).then(([$1, $2]) => $1 ?? $2),
  )

  const sTokensTransferEvents = await whenNotErrorAll(
    [sTokens, sTokensFromBlock, sTokensToBlock],
    ([tokens, from, to]) =>
      whenDefinedAll([tokens, from, to], async ([_stokens, _from, _to]) => {
        const event = _stokens.contract().filters.Transfer()
        const logs = await _stokens.contract().queryFilter(event, _from, _to)
        const sorted = logs.sort((a, b) => a.index - b.index)
        const res = sorted.map((log) => {
          const [from, to, id] = _stokens
            .contract()
            .interface.decodeEventLog('Transfer', log.data, log.topics)
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
      }) ?? new Error('Failed to fetch sTokens transfer events'),
  )

  const sTokensAssetDocs = whenNotError(sTokensTransferEvents, (events) =>
    events.map(({ id, to: owner, block }) => {
      const doc = assetDocument({
        type: 'nft',
        contract: addresses.polygon.mainnet.sTokens,
        id,
        owner,
        block,
        balance: '1',
      })
      console.log({ doc })
      return doc
    }),
  )

  await whenNotError(sTokensAssetDocs, (docs) =>
    Promise.all(
      docs.map((doc) =>
        client.json.set(
          generateAssetKey(addresses.polygon.mainnet.sTokens, doc.id),
          '$',
          doc,
        ),
      ),
    ),
  )

  const log: ErrorOr<LogDocument> = whenNotError(sTokensToBlock, (block) => ({
    contract: addresses.polygon.mainnet.sTokens,
    block: block.toString(),
    nBlock: block,
  }))

  await whenNotError(log, (_log) =>
    client.json.set(
      generateLogKey(addresses.polygon.mainnet.sTokens),
      '$',
      _log,
    ),
  )

  console.log(
    '@@@@',
    await client.ft.search(
      Index.Asset,
      `@contract:{0x89904De861CDEd2567695271A511B3556659FfA2}`,
      { LIMIT: { from: 0, size: 10 } },
    ),
  )

  await client.quit()

  return new Response(
    json({ sTokens: isNotError(sTokensAssetDocs) ? sTokensAssetDocs : [] }),
    {
      status: 200,
      headers,
    },
  )
}
