import { getDefaultProvider } from 'ethers'

import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'

import { type Achievement } from '../types'
import {
  ACHIEVEMENT_PREFIX,
  getAchievementDocument,
  checkForExistingAchievementId,
} from '../utils'
import { getDefaultClient } from '../db/redis'

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
      return new Response(JSON.stringify({ error: 'Bad data' }), {
        status: 401,
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
        { status: 401 },
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
        status: 404,
      })
    }

    // 7. Create achievement document.
    const achievementDocument = getAchievementDocument({
      ...achievement,
    })
    // 8. Check if achivementId is already present.
    if (await checkForExistingAchievementId(achievementDocument.id)) {
      return new Response(
        JSON.stringify({ error: 'Achievement already exists' }),
        { status: 400 },
      )
    }
    // 9. Seth the record and update timestamp of record.
    await client.json.set(`${ACHIEVEMENT_PREFIX}::${achievement.id}`, '$', {
      ...achievement,
      createdOnTimestamp: Date.now(),
    })

    // 10. Return the id as response of the new data saved
    return new Response(JSON.stringify({ id: achievement.id }), { status: 200 })
  }

export default handler
