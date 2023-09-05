import { generateProfileId } from '@fixtures/api/keys'
import { createClient } from 'redis'
import type { Profile } from '.'

export const GET = async ({
  params: { id },
}: {
  params: { id: string | undefined }
}) => {
  if (!id) {
    return new Response(JSON.stringify({ error: 'No profile ID passed' }), {
      status: 401,
    })
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

  const profileId = generateProfileId(id)

  const userProfile = (await client.get(profileId)) ?? '{}'
  await client.quit()

  return new Response(userProfile, {
    status: 200,
  })
}
