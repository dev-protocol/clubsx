import { generateProfileId } from '@fixtures/api/keys'
import { getProfile } from '@fixtures/api/profile'
import { createClient } from 'redis'
import { type Profile } from '.'

export const POST = async ({ request }: { request: Request }) => {
  const { profileId, skinIndex } = (await request.json()) as {
    profileId: string
    skinIndex: number
  }
  const profile: Profile = await getProfile({ id: profileId })

  if (!profile) {
    return new Response(JSON.stringify({ error: 'No profile found' }), {
      status: 401,
    })
  }
  const newProfile = {
    ...profile,
    skins: (profile?.skins ?? [{ likes: 0 }]).map((skin, index) => {
      if (Number(index) === Number(skinIndex)) {
        return {
          ...skin,
          likes: (skin?.likes ? skin.likes : 0) + 1,
        }
      }
      return skin
    }),
  }

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

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const profileIdForDB = generateProfileId(profileId)

  try {
    await client.set(profileIdForDB, JSON.stringify(newProfile))
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
