import {
  AchievementPrefix,
  achievementDocument,
  type NumberAttribute,
  type StringAttribute,
} from '../redis-schema'
import { getDefaultClient } from '../redis'
import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'
import { getDefaultProvider } from 'ethers'

const checkExisting = async ({ id }: { id: string }) => {
  const client = await getDefaultClient()
  const keyExists = await client.exists(
    `${AchievementPrefix.Achievement}::${id}`,
  )
  return keyExists === 1 ? true : false
}

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    const {
      achievement: achievementData,
      signature,
      message,
    } = (await request.json()) as {
      achievement: {
        id: string
        contract: string
        metadata: {
          name: string
          description: string
          image: string
          numberAttributes: NumberAttribute[]
          stringAttributes: StringAttribute[]
        }
      }
      message: string
      signature: string
    }

    const client = await getDefaultClient()

    const authenticated = await authenticate({
      message,
      signature,
      previousConfiguration: encode(conf),
      provider: getDefaultProvider(conf.rpcUrl),
    })

    if (!authenticated) {
      return new Response(JSON.stringify({}), { status: 401 })
    }

    const achievement = achievementDocument({
      ...achievementData,
    })

    if (await checkExisting({ id: achievement.id })) {
      return new Response(
        JSON.stringify({ error: 'Achievement already exists' }),
        { status: 400 },
      )
    }

    await client.set(
      `${AchievementPrefix.Achievement}::${achievement.id}`,
      JSON.stringify(achievement),
    )

    return new Response(JSON.stringify({ id: achievement.id }), { status: 200 })
  }

export default handler
