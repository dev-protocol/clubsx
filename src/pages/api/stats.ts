import { createClient } from 'redis'

export type ClubsData = {
  name: string
  created: string
}

export type Stats = {
  date: Date
  config: string
}

export const uniqueCreators = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: () => {
        return 1000
      },
    },
  })
  try {
    await client.connect()

    const keys = (await client.keys('*')).filter((key) =>
      key.startsWith('id::')
    )
    const uniqueCreators = keys.length
    return new Response(JSON.stringify({ uniqueCreators }), { status: 200 })
  } catch (error) {
    console.error('redis connection error: ', error)
    return new Response('Internal Server Error', { status: 500 })
  } finally {
    await client.quit()
  }
}

export const allClubs = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: () => {
        return 1000
      },
    },
  })

  try {
    await client.connect()

    const keys = (await client.keys('*')).filter((key) =>
      key.startsWith('id::')
    )
    const data: Stats[] = []

    for (const key of keys) {
      const sites = JSON.parse((await client.get(key)) ?? '[]') as
        | ClubsData[]
        | null

      if (!sites) {
        return new Response(JSON.stringify({ error: 'No user sites found' }), {
          status: 400,
        })
      }

      for (const site of sites) {
        const config = await client.get(site.name)

        if (!config) {
          continue
        }

        data.push({ date: new Date(site.created), config: config })
      }
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('redis connection error: ', error)
    return new Response('Internal Server Error', { status: 500 })
  } finally {
    await client.quit()
  }
}

export const post = async ({ request }: { request: Request }) => {
  const route = request.url.split('?').pop()

  if (route === 'allClubs') {
    return await allClubs()
  }
  if (route === 'uniqueCreators') {
    return await uniqueCreators()
  } else {
    return new Response('Not found', { status: 404 })
  }
}
