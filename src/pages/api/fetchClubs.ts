import { createClient } from 'redis'

export const get = async ({ request }: { request: Request }) => {
  const { userAddress } = (await request.json()) as {
    userAddress: string
  }

  if (!userAddress) {
    return new Response(JSON.stringify({ error: 'No user address passed' }), {
      status: 401,
    })
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

  const userSites = (await client.get(userAddress)) as string[] | null
  if (!userSites) {
    return new Response(JSON.stringify({ error: 'No user sites found' }), {
      status: 400,
    })
  }

  return new Response(JSON.stringify(userSites), { status: 200 })
}
