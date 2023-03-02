import { utils } from 'ethers'
import { createClient } from 'redis'

import { generateClubPluginsId } from '@fixtures/api/keys'

export const post = async ({ request }: { request: Request }) => {
  const { site, pluginName, sig, hash, expectedAddress } =
    (await request.json()) as {
      sig: string
      site: string
      hash: string
      pluginName: string
      expectedAddress: string
    }

  // We need hash and signature.
  const hashAndSignGiven = !!hash && !!sig && !!expectedAddress
  if (!hashAndSignGiven) {
    return new Response(JSON.stringify({ error: 'Auth failed' }), {
      status: 401,
    })
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

  const clubPluginsDbId = generateClubPluginsId(site)
  const clubsPlugins = JSON.parse((await client.get(clubPluginsDbId)) ?? '[]') as string[]

  const address = utils.recoverAddress(utils.hashMessage(hash), sig)
  if (address.toLowerCase() != expectedAddress.toLowerCase()) {
    return new Response(
      JSON.stringify({ error: 'Auth failed: invalid sig' }),
      {
        status: 401,
      }
    )
  }

  try {
    // Add the new plugin to the response.
    await client.set(
      clubPluginsDbId,
      JSON.stringify([...clubsPlugins, pluginName])
    )
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
