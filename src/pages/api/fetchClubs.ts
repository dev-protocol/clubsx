import { ClubsConfiguration, decode } from '@devprotocol/clubs-core'
import { generateId } from '@fixtures/api/keys'
import { createClient } from 'redis'

export type ClubsData = {
  name: string
  created: string
}

export type ClubsRawResponse = {
  error: string
  status: number
  configs: ClubsConfiguration[]
}

export const fetchClubs = async (
  identifier: string | undefined
): Promise<ClubsRawResponse> => {
  if (!identifier) {
    return {
      error: 'No user identifier passed',
      status: 401,
      configs: [] as ClubsConfiguration[],
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

  /**
   * Fetch site names associated with user
   */
  const userSites = JSON.parse(
    (await client.get(generateId(identifier))) ?? '[]'
  ) as ClubsData[] | null
  if (!userSites) {
    return {
      status: 400,
      error: 'No user sites found',
      configs: [] as ClubsConfiguration[],
    }
  }

  /**
   * Fetch user clubs configs
   */
  const configs: ClubsConfiguration[] = [] as ClubsConfiguration[]

  for (const site of userSites) {
    const config: string | null = await client.get(site.name)
    if (!config) continue
    configs.push(decode(config))
  }

  await client.disconnect()
  return { status: 200, error: '', configs: configs }
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

  const res = await fetchClubs(identifier)

  return new Response(
    JSON.stringify(
      res.error && res.error !== '' ? { error: res.error } : res.configs
    ),
    { status: res.status }
  )
}
