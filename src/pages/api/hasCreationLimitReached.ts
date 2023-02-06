import { createClient } from 'redis'
import { generateId } from '@fixtures/api/keys'

import type { ClubsData } from './fetchClubs'

export const hasCreationLimitReached = async (
  identifier: string
): Promise<boolean> => {
  if (!identifier) return true

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

  const userSites = JSON.parse(
    (await client.get(generateId(identifier))) ?? '[]'
  ) as ClubsData[] | null

  await client.disconnect()
  return (userSites &&
    userSites.length >=
      Number(import.meta.env.MAX_CLUBS_CREATION_ALLOWED || 3)) as boolean
}

export const post = async ({ request }: { request: Request }) => {
  const { identifier } = (await request.json()) as {
    identifier: string
  }

  if (!identifier) {
    return new Response(
      JSON.stringify({ error: 'No user identifier passed' }),
      {
        status: 401,
      }
    )
  }

  const isCreationLimitReached: boolean = await hasCreationLimitReached(
    identifier
  )
  return new Response(JSON.stringify({ isCreationLimitReached }), {
    status: 200,
  })
}
