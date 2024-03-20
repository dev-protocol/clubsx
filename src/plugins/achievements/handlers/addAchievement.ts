import { getDefaultProvider } from 'ethers'

import {
  authenticate,
  type ClubsConfiguration,
  encode,
  type ClubsPlugin,
  type ClubsPluginOption,
} from '@devprotocol/clubs-core'

import { meta } from '../index'
import { type Achievement } from '../types'
import { getDefaultClient } from '../db/redis'
import {
  AchievementPrefix,
  getAchievementInfoDocument,
  getAchievementItemDocument,
  checkForExistingAchievementInfo,
  checkForExistingAchievementItem,
  PLUGIN_ACHIEVEMENT_IDS_OPTION_KEY,
} from '../utils'

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    // 1. Get the data.
    const { site, message, signature, achievement } =
      (await request.json()) as {
        site: string
        message: string
        signature: string
        achievement: Omit<
          Achievement,
          | 'id'
          | 'achievementInfoId'
          | 'claimed'
          | 'claimedSBTTokenId'
          | 'createdOnTimestamp'
          | 'claimedOnTimestamp'
        >
      }
    // 2. Validate all data is present.
    if (!achievement || !message || !signature || !site) {
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

    // // 4. Authenticate for only admin's allowed to add achievements.
    // const previousConfiguration = await client.get(site)
    // if (!previousConfiguration || previousConfiguration !== encode(conf)) {
    //   return new Response(
    //     JSON.stringify({ error: 'Encoded config not found' }),
    //     {
    //       status: 401,
    //     },
    //   )
    // }
    // const authenticated = await authenticate({
    //   message,
    //   signature,
    //   previousConfiguration,
    //   provider: getDefaultProvider(conf.rpcUrl),
    // })
    // // 5. Validate authentication.
    // if (!authenticated) {
    //   return new Response(JSON.stringify({ error: 'Invalid access' }), {
    //     status: 401,
    //   })
    // }

    // 6. Fetch plugin and it's options
    const plugin = conf.plugins.find((plgn: ClubsPlugin) => plgn.id === meta.id)
    if (!plugin || !plugin.enable) {
      return new Response(JSON.stringify({ error: 'Invalid plugin' }), {
        status: 401,
      })
    }
    const achievementIdsOption = plugin.options.find(
      (optn: ClubsPluginOption) =>
        optn.key === PLUGIN_ACHIEVEMENT_IDS_OPTION_KEY,
    )
    if (!achievementIdsOption) {
      return new Response(JSON.stringify({ error: 'Invalid plugin' }), {
        status: 401,
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

    // 9. Check if achivement info is already present
    if (!(await checkForExistingAchievementInfo(achievementInfoDocument.id))) {
      // We are creating a new type of achievement.
      await client.json.set(
        `${AchievementPrefix.AchievementInfo}::${achievementInfoDocument.id}`,
        '$',
        achievementInfoDocument,
      )
    }

    // 10. Seth the record and update timestamp of record.
    await client.json.set(
      `${AchievementPrefix.AchievementItem}::${achievementItemDocument.id}`,
      '$',
      achievementItemDocument,
    )

    // 11. Set the achivement id in the clubs config plugin options.
    const updatedConfig = {
      ...conf, // Keep all the remaining params same.
      plugins: [
        ...conf.plugins.filter((plgn: ClubsPlugin) => plgn.id !== meta.id), // Keep all the remaining plugins same.
        {
          ...plugin,
          options: [
            ...plugin.options.filter(
              (optn: ClubsPluginOption) =>
                optn.key !== PLUGIN_ACHIEVEMENT_IDS_OPTION_KEY,
            ), // Keep all the remaining plugin options same.
            {
              ...achievementIdsOption,
              value: [
                ...(achievementIdsOption.value as string[]),
                achievementItemDocument.id,
              ], // Add new id in the array, we know the .value will be array since we are setting this to [] while installing plugin.
            },
          ],
        },
      ],
    }
    await client.set(site, encode(updatedConfig))

    // 12. Return the id as response of the new data saved
    return new Response(JSON.stringify({ id: achievementItemDocument.id }), {
      status: 200,
    })
  }

export default handler
