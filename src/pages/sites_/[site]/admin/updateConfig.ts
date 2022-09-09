import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { site, config } = (await request.json()) as {
    site: string
    config: string
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

  await client.set(site, config)

  await client.quit()

  return new Response(JSON.stringify({}), { status: 200 })
}
