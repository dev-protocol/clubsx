import { providers, utils} from 'ethers'
import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash, expectedAddress } = (await request.json()) as {
    site: string
    config: string
    hash: string
    sig: string
    expectedAddress: string
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

  // Unlike updateConfig, where previousConfiguration has to be there,
  // here previousConfiguration should not be there.
  const previousConfiguration = await client.get(site)
  if (previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Config already found' }), {
      status: 401,
    })
  }

  const address = utils.recoverAddress(utils.hashMessage(hash), sig)
  if (address.toLowerCase() != expectedAddress.toLowerCase()) {
    return new Response(JSON.stringify({error: "Invalid address"}), { status: 401 })
  }

  try {
    await client.set(site, config)
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
