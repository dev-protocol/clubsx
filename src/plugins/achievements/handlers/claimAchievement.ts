import { verifyMessage } from 'ethers'

import {
  whenNotErrorAll,
  type UndefinedOr,
  whenNotError,
} from '@devprotocol/util-ts'

import { getDefaultClient } from '../db/redis'
import { ACHIEVEMENT_ITEM_SCHEMA } from '../db/schema'
import {
  type Achievement,
  type ClaimAchievementApiHandlerParams,
} from '../types'
import {
  AchievementIndex,
  AchievementPrefix,
  checkForExistingAchievementInfo,
  checkForExistingAchievementItem,
  uuidToQuery,
} from '../utils'

export const handler =
  ({ rpcUrl, chainId, property }: ClaimAchievementApiHandlerParams) =>
  async ({ request }: { readonly request: Request }) => {
    // 1. Get the req data.
    const { message, signature, achievementItemId } =
      (await request.json()) as {
        message: string
        signature: string
        achievementItemId: string
      }
    // 2. Validated presence of req data.
    if (!achievementItemId || !message || !signature) {
      return new Response(JSON.stringify({ error: 'Bad data' }), {
        status: 400,
      })
    }
    if (!(await checkForExistingAchievementItem(achievementItemId))) {
      return new Response(JSON.stringify({ error: 'Bad achievement data' }), {
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
    const achievementitemData = await whenNotErrorAll(
      [achievementItemId, client],
      ([_id, _client]) =>
        _client.ft.search(
          AchievementIndex.AchievementItem,
          `@${ACHIEVEMENT_ITEM_SCHEMA['$.id'].AS}:{${uuidToQuery(_id)}}`,
          {
            LIMIT: {
              from: 0,
              size: 1,
            },
          },
        ),
    )
    // 5. Fetch achievement from mapped documents.
    const achievementItem = whenNotError(
      achievementitemData,
      (d) =>
        (d.documents.find((x) => x.value)?.value as UndefinedOr<Achievement>) ??
        new Error('ID is not found.'),
    )
    // 6. Validate achievement is fetched properly.
    if (achievementItem instanceof Error) {
      return new Response(
        JSON.stringify({ error: 'Achievement is not found' }),
        {
          status: 400,
        },
      )
    }
    // 7. Validated achievement ids are matched and that achievement info also exists
    if (
      achievementItemId !== achievementItem.id ||
      !(await checkForExistingAchievementInfo(
        achievementItem.achievementInfoId,
      ))
    ) {
      return new Response(JSON.stringify({ error: 'Bad data sent to api' }), {
        status: 400,
      })
    }
    // 8. Validate if achievement is already claimed.
    if (achievementItem.claimed) {
      return new Response(
        JSON.stringify({ error: 'Achievement already claimed' }),
        {
          status: 400,
        },
      )
    }

    // 9. Get the msg.sender / claimer addr.
    const account = verifyMessage(message, signature)
    // 10. Valdiate that claimer address is same as the one who is rewarded with achievement.
    if (account !== achievementItem.account) {
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
      `${AchievementPrefix.AchievementInfo}::${achievementItemId}`,
      '$',
      {
        ...achievementItem,
        claimedOnTimestamp: Date.now(),
        claimed: true,
        claimedSBTTokenId: claimedSBTTokenId,
      },
    )

    // 10. Return response.
    return new Response(
      JSON.stringify({ id: achievementItemId, claimedSBTTokenId }),
      { status: 200 },
    )
  }

export default handler
