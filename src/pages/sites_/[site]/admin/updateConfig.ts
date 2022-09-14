import { utils } from 'ethers'
import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { site, config, sig, expectedAddress } = (await request.json()) as {
    site: string
    config: string
    hash: string
    sig: string
    expectedAddress: string
  }

  const digest = utils.hashMessage(config)
  const actual = utils.recoverAddress(digest, sig)
  console.log('actual is: ', actual)

  return

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
