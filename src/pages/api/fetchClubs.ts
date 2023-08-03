import { decode } from '@devprotocol/clubs-core'
import { generateId } from '@fixtures/api/keys'
import { createClient } from 'redis'

export type ClubsData = {
  name: string
  created: string
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
      },
    )
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

  /**
   * Fetch site names associated with user
   */
  const userSites = JSON.parse(
    (await client.get(generateId(identifier))) ?? '[]',
  ) as ClubsData[] | null
  if (!userSites) {
    return new Response(JSON.stringify({ error: 'No user sites found' }), {
      status: 400,
    })
  }

  /**
   * Fetch user clubs configs
   */
  const configs = []

  for (const site of userSites) {
    const config = await client.get(site.name)
    if (!config) continue
    configs.push(decode(config))
  }

  await client.disconnect()

  return new Response(JSON.stringify(configs), { status: 200 })
}
