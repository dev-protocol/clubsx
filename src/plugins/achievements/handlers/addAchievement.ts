import { getDefaultProvider } from 'ethers'

import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'

import type { Achievement, AchievementItem } from '../types'
import { getDefaultClient } from '../db/redis'
import {
  AchievementPrefix,
  getAchievementInfoDocument,
  checkForExistingAchievementInfo,
  checkForExistingAchievementItem,
  createAchievementItemId,
} from '../utils'

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    // 1. Get the data.
    const { message, signature, achievement, noOfCopies } =
      (await request.json()) as {
        message: string
        signature: string
        noOfCopies: number
        achievement: Omit<
          Achievement,
          | 'id'
          | 'clubsUrl'
          | 'achievementInfoId'
          | 'claimed'
          | 'claimedSBTTokenId'
          | 'createdOnTimestamp'
          | 'claimedOnTimestamp'
        >
      }
    // 2. Validate all data is present.
    if (!achievement || !message || !signature || !conf.url || !noOfCopies) {
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
      })
    }

    // 3. Get client and validate client.
    const client = await getDefaultClient()
    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 500,
      })
    }

    // 4. Authenticate for only admin's allowed to add achievements.
    const previousConfiguration = encode(conf)
    const authenticated = await authenticate({
      message,
      signature,
      previousConfiguration,
      provider: getDefaultProvider(conf.rpcUrl),
    })
    // 5. Validate authentication.
    if (!authenticated) {
      return new Response(JSON.stringify({ error: 'Invalid access' }), {
        status: 401,
      })
    }

    // 6. Create achievement document.
    const achievementInfoDocument = getAchievementInfoDocument({
      contract: achievement.contract,
      metadata: {
        ...achievement.metadata,
      },
    })

    // 7. Check if achivement info is already present
    if (!(await checkForExistingAchievementInfo(achievementInfoDocument.id))) {
      // We are creating a new type of achievement.
      await client.json.set(
        `${AchievementPrefix.AchievementInfo}::${achievementInfoDocument.id}`,
        '$',
        achievementInfoDocument,
      )
    }

    // 8. Create a list of all the achievement ids to be created (since no. of achievements >= 1)
    const achievementItemIds: string[] = []
    for (let i = 0; i < noOfCopies; i++) {
      // 8.a. Get the id of newly created achievement item.
      const achievementId = createAchievementItemId()
      // 8.b. Check if achivementId is already present.
      if (await checkForExistingAchievementItem(achievementId)) {
        return new Response(
          JSON.stringify({ error: 'Achievement already exists' }),
          { status: 400 },
        )
      }
      // 8.c Save the achivements ids to save in db and return them as response.
      achievementItemIds.push(achievementId)
    }

    // 9. Seth the record and update timestamp of record.
    await Promise.all(
      achievementItemIds.map(
        async (achievementId: string) =>
          await client.json.set(
            `${AchievementPrefix.AchievementItem}::${achievementId}`,
            '$',
            {
              id: achievementId,
              achievementInfoId: achievementInfoDocument.id,
              account: achievement.account,
              claimed: false,
              claimedSBTTokenId: 0,
              createdOnTimestamp: Date.now(),
              claimedOnTimestamp: 0,
              clubsUrl: conf.url,
            } as AchievementItem,
          ),
      ),
    )

    await client.quit()

    // 10. Return the id as response of the new data saved
    return new Response(JSON.stringify({ ids: achievementItemIds }), {
      status: 200,
    })
  }

export default handler
