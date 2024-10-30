import type { UndefinedOr } from '@devprotocol/util-ts'
import { createClient } from 'redis'

import { generateProfileId } from '@fixtures/api/keys'
import { getProfile } from '@fixtures/api/profile'
import { type Profile, type Skin } from '.'

export const POST = async ({ request }: { request: Request }) => {
  const { profileId, skinId, likesCount } = (await request.json()) as {
    profileId: string
    likesCount: number
    skinId: UndefinedOr<string>
  }
  if (!profileId || !likesCount) {
    return new Response(JSON.stringify({ error: 'Invalid data' }), {
      status: 401,
    })
  }

  const profile: Profile = await getProfile({ id: profileId })
  if (!profile) {
    return new Response(JSON.stringify({ error: 'No profile found' }), {
      status: 401,
    })
  }

  // Get the value to increment.
  const absLikesCount = Math.abs(likesCount)
  let newProfile: Profile = { ...profile }

  if (!skinId) {
    // If skinId is not present that means we are currently liking the profile and not profile.skins.at(<any>).
    newProfile = {
      ...profile,
      likes: (profile?.likes ?? 0) + absLikesCount,
    }
  } else {
    // Else skinId present that means we are currently liking profile.skins.at(<with index = skinId>).

    // Find the index of the skin as per the ID.
    const skinIndex =
      profile?.skins?.findIndex((skin) => skin.id === skinId) ?? -1
    // If index is not found then we return error.
    if (skinIndex === -1) {
      return new Response(JSON.stringify({ error: 'Profile skin not found' }), {
        status: 401,
      })
    }

    newProfile = {
      ...profile, // Retain properties of the skin.
      skins: [
        ...(profile?.skins?.slice(0, skinIndex) ?? []), // Retain all the skins before the being updated skin.

        {
          // Modify the property  of the updated skin.
          ...(profile?.skins?.at(skinIndex) ?? ({} as Skin)),
          likes: (profile?.skins?.at(skinIndex)?.likes ?? 0) + absLikesCount,
        },

        ...(profile?.skins?.slice(skinIndex + 1) ?? []), // Retain all the skins before the being updated skin.
      ],
    }
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
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  await client.quit()
  return new Response(JSON.stringify({}), { status: 200 })
}
