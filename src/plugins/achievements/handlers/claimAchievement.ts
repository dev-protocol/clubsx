import { getDefaultClient } from '../redis'
import { verifyMessage } from 'ethers'
import { check } from './checkAchievement'
import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
} from '@devprotocol/util-ts'
import {
  AchievementIndex,
  schemaAchievement,
  uuidToQuery,
  type Achievement,
} from '../redis-schema'

type HandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
}

export const handler =
  ({ rpcUrl, chainId, property }: HandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    const { signature, message, achievementId } = (await request.json()) as {
      signature: string
      message: string
      achievementId: string
    }

    const client = await getDefaultClient()

    // Try to fetch the mapped achievement.
    const data = await whenNotErrorAll(
      [achievementId, client],
      ([_id, _client]) =>
        _client.ft.search(
          AchievementIndex.Achievement,
          `@${schemaAchievement['$.id'].AS}:{${uuidToQuery(_id)}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        ),
    )

    const achievement = whenNotError(
      data,
      (d) =>
        (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
        new Error('ID is not found.'),
    )

    if (achievement instanceof Error) {
      return new Response(JSON.stringify({ error: 'ID is not found' }), {
        status: 400,
      })
    }

    // get the ethereum address from the signature
    // const signer = await getSigne(signature, message)
    const address = verifyMessage(message, signature)

    const available = await check({
      id: achievementId,
      account: address,
      client,
    })

    if (!available) {
      return new Response(
        JSON.stringify({ error: 'Achievement not available' }),
        {
          status: 401,
        },
      )
    }

    // TODO: add logic to mint SBT via send.devprotocol.xyz

    return new Response(JSON.stringify({ id: achievementId }), { status: 200 })
  }

export default handler
