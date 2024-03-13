import { verifyMessage } from 'ethers'

import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
} from '@devprotocol/util-ts'

import { getDefaultClient } from '../db/redis'
import { ACHIEVEMENT_SCHEMA } from '../db/schema'
import {
  type Achievement,
  type ClaimAchievementApiHandlerParams,
} from '../types'
import {
  ACHIEVEMENT_INDEX,
  ACHIEVEMENT_PREFIX,
  checkForExistingAchievementId,
  uuidToQuery,
} from '../utils'

export const handler =
  ({ rpcUrl, chainId, property }: ClaimAchievementApiHandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    // 1. Get the req data.
    const { message, signature, achievementId } = (await request.json()) as {
      message: string
      signature: string
      achievementId: string
    }
    // 2. Validated presence of req data.
    if (
      !achievementId ||
      !message ||
      !signature ||
      !(await checkForExistingAchievementId(achievementId))
    ) {
      return new Response(JSON.stringify({ error: 'Bad data' }), {
        status: 400,
      })
    }

    // 3. Get client and validate it.
    const client = await getDefaultClient()
    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 500,
      })
    }

    // 4. Fetch the mapped achievement documents.
    const data = await whenNotErrorAll(
      [achievementId, client],
      ([_id, _client]) =>
        _client.ft.search(
          ACHIEVEMENT_INDEX,
          `@${ACHIEVEMENT_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        ),
    )
    // 5. Fetch achievement from mapped documents.
    const achievement = whenNotError(
      data,
      (d) =>
        (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
        new Error('ID is not found.'),
    )
    // 6. Validate achievement is fetched properly.
    if (achievement instanceof Error) {
      return new Response(
        JSON.stringify({ error: 'Achievement is not found' }),
        {
          status: 400,
        },
      )
    }
    // 7. Validated achievement ids are matched.
    if (achievementId !== achievement.id) {
      return new Response(JSON.stringify({ error: 'Bad data sent to api' }), {
        status: 400,
      })
    }
    // 8. Validate if achievement is already claimed.
    if (achievement.claimed) {
      return new Response(
        JSON.stringify({ error: 'Achievement already claimed' }),
        {
          status: 401,
        },
      )
    }

    // 9. Get the msg.sender / claimer addr.
    const account = verifyMessage(message, signature)
    // 10. Valdiate that claimer address is same as the one who is rewarded with achievement.
    if (account !== achievement.account) {
      return new Response(
        JSON.stringify({ error: 'Sender not achievement receiver' }),
        {
          status: 400,
        },
      )
    }

    // TODO: add logic to mint and detect minted SBT via send.devprotocol.xyz

    // 9. Update the record to mark the achievement as claimed.
    const claimedSBTTokenId = 1
    await client.json.set(
      `${ACHIEVEMENT_PREFIX}::${achievementId}`,
      '$',
      JSON.stringify({
        ...achievement,
        claimedOnTimestamp: Date.now(),
        claimed: true,
        claimedSBTTokenId: claimedSBTTokenId,
      }),
    )

    // 10. Return response.
    return new Response(
      JSON.stringify({ id: achievementId, claimedSBTTokenId }),
      { status: 200 },
    )
  }

export default handler
