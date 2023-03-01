import { decode } from '@devprotocol/clubs-core'
import { generateId } from '@fixtures/api/keys'
import { createClient } from 'redis'

export type ClubsData = {
  name: string
  created: string
}

export const post = async ({ request }: { request: Request }) => {
  console.log('@@@', 1, { request })
  const { identifier } = (await request.json()) as {
    identifier: string
  }
  console.log('@@@', 2, { identifier })

  if (!identifier) {
    console.log('***', 1, { identifier })
    return new Response(
      JSON.stringify({ error: 'No user identifier passed' }),
      {
        status: 401,
      }
    )
  }
  console.log('@@@', 3)

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

  console.log('@@@', 4, { client })

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  /**
   * Fetch site names associated with user
   */
  const userSites = JSON.parse(
    (await client.get(generateId(identifier))) ?? '[]'
  ) as ClubsData[] | null
  if (!userSites) {
    console.log('***', 2, { userSites })
    return new Response(JSON.stringify({ error: 'No user sites found' }), {
      status: 400,
    })
  }

  console.log('@@@', 5, { userSites })

  /**
   * Fetch user clubs configs
   */
  const configs = []

  for (const site of userSites) {
    console.log('@@@', 6, { site })
    const config = await client.get(site.name)
    if (!config) continue
    configs.push(decode(config))
  }

  await client.disconnect()

  console.log('@@@', 7, { configs })

  return new Response(JSON.stringify(configs), { status: 200 })
}
