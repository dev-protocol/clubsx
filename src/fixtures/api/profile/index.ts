import { generateProfileId } from '@fixtures/api/keys'
import { createClient } from 'redis'
import type { Profile } from '@pages/api/profile'
import { getDefaultProfile } from './utils'
import { mergeDeepRight } from 'ramda'

export const getProfile = async ({ id }: { id: string }) => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: 1,
    },
  })
  await client.connect()

  const profileId = generateProfileId(id)

  const userProfileData = (await client.get(profileId)) ?? '{}'

  await client.quit()

  const fromDb: Profile = JSON.parse(userProfileData)
  const userAvatar = fromDb.avatar
  const userName = fromDb.username
  const defaultProfile: Profile =
    !userAvatar || !userName ? await getDefaultProfile({ id }) : {}

  const profile = mergeDeepRight(defaultProfile, fromDb)

  return profile
}
