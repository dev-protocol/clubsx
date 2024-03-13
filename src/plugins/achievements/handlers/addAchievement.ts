import { getDefaultProvider } from 'ethers'

import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'

import { type Achievement } from '../types'
import { getDefaultClient } from '../db/redis'
import {
  AchievementPrefix,
  getAchievementInfoDocument,
  getAchievementItemDocument,
  checkForExistingAchievementInfo,
  checkForExistingAchievementItem,
} from '../utils'

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    // 1. Get the data.
    const { message, signature, achievement } = (await request.json()) as {
      message: string
      signature: string
      achievement: Achievement
    }
    // 2. Validate all data is present.
    if (!achievement || !message || !signature) {
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
      })
    }
    // 3. Validate data is not corrupt.
    if (
      achievement.claimed ||
      achievement.claimedOnTimestamp > 0 ||
      achievement.createdOnTimestamp > 0 ||
      achievement.claimedSBTTokenId > 0
    ) {
      return new Response(
        JSON.stringify({ error: 'Cannot created bad achievement' }),
        { status: 400 },
      )
    }

    // 4. Authenticate for only admin's allowed to add achievements.
    const authenticated = await authenticate({
      message,
      signature,
      previousConfiguration: encode(conf),
      provider: getDefaultProvider(conf.rpcUrl),
    })
    // 5. Validate authentication.
    if (!authenticated) {
      return new Response(JSON.stringify({ error: 'Invalid access' }), {
        status: 401,
      })
    }

    // 6. Get client and validate client.
    const client = await getDefaultClient()
    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 500,
      })
    }

    // 7. Create achievement document.
    const achievementInfoDocument = getAchievementInfoDocument({
      contract: achievement.contract,
      metadata: {
        ...achievement.metadata,
      },
    })
    const achievementItemDocument = getAchievementItemDocument({
      achievementInfoId: achievementInfoDocument.id,
      account: achievement.account,
      claimed: false,
      claimedSBTTokenId: 0,
      createdOnTimestamp: Date.now(),
      claimedOnTimestamp: 0,
    })

    // 8. Check if achivementId is already present.
    if (await checkForExistingAchievementItem(achievementItemDocument.id)) {
      return new Response(
        JSON.stringify({ error: 'Achievement already exists' }),
        { status: 400 },
      )
    }

    const isAchievementInfoPresent = await checkForExistingAchievementInfo(
      achievementInfoDocument.id,
    )
    if (!isAchievementInfoPresent) {
      // We are creating a new type of achievement.
      await client.json.set(
        `${AchievementPrefix.AchievementInfo}::${achievementInfoDocument.id}`,
        '$',
        achievementInfoDocument,
      )
    }

    // 9. Seth the record and update timestamp of record.
    await client.json.set(
      `${AchievementPrefix.AchievementItem}::${achievement.id}`,
      '$',
      achievementItemDocument,
    )

    // 10. Return the id as response of the new data saved
    return new Response(JSON.stringify({ id: achievement.id }), { status: 200 })
  }

export default handler
