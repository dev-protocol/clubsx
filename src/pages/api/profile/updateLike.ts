import { generateProfileId } from '@fixtures/api/keys'
import { getProfile } from '@fixtures/api/profile'
import { hashMessage, recoverAddress } from 'ethers'
import { createClient } from 'redis'
import { type Profile } from '.'

export const POST = async ({ request }: { request: Request }) => {
  const { profileId, skinIndex } = (await request.json()) as {
    profileId: string
    skinIndex: number
  }
  console.log('ProfileId', profileId)
  console.log('SkinIndex', skinIndex)
  const profile: Profile = await getProfile({ id: profileId })

  console.log('Old profile skins', profile.skins)

  if (!profile) {
    return new Response(JSON.stringify({ error: 'No profile found' }), {
      status: 401,
    })
  }
  const newProfile = {
    ...profile,
    skins: profile?.skins?.map((skin, index) => {
      console.log('Index', index)
      console.log('SkinIndex', skinIndex)
      console.log('Skin inside', skin)
      if (index === skinIndex) {
        return {
          ...skin,
          likes: (skin?.likes ? skin.likes : 0) + 1,
        }
      }
      return skin
    }),
  }
  console.log('Skins', newProfile.skins)
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

  try {
    await client.set(profileId, JSON.stringify(newProfile))
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
