import { generateId } from '@fixtures/api/keys'
import { createClient } from 'redis'

export type ClubsData = {
  name: string
  created: string
}

export const get = async ({ request }: { request: Request }) => {
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

  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const userSites = (await client.get(generateId(identifier))) as
    | ClubsData[]
    | null
  if (!userSites) {
    return new Response(JSON.stringify({ error: 'No user sites found' }), {
      status: 400,
    })
  }

  return new Response(JSON.stringify(userSites), { status: 200 })
}
