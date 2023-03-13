import { providers, utils } from 'ethers'
import { createClient } from 'redis'

import { InstallablePlugins, installablePlugins } from '@constants/plugins'
import { generateClubPluginsId } from '@fixtures/api/keys'
import { authenticate, decode } from '@devprotocol/clubs-core'

export const post = async ({ request }: { request: Request }) => {
  const { site, pluginName, sig, hash } = (await request.json()) as {
    sig: string
    site: string
    hash: string
    pluginName: string
  }

  // We need hash and signature.
  const hashAndSignGiven = !!hash && !!sig
  if (!hashAndSignGiven || !pluginName || !site) {
    return new Response(
      JSON.stringify({ error: 'Invalid request: missing required params' }),
      {
        status: 401,
      }
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

  const previousConfiguration = await client.get(site)
  if (!previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Encoded config not found' }), {
      status: 401,
    })
  }

  const clubPluginsDbId = generateClubPluginsId(site)
  const clubsPlugins = JSON.parse(
    (await client.get(clubPluginsDbId)) ?? '[]'
  ) as string[]

  // The plugin name should be in the list of installable plugins.
  const isPluginInstallable = installablePlugins.find(
    (ip: InstallablePlugins) => ip.name === pluginName
  )
  if (!isPluginInstallable) {
    return new Response(JSON.stringify({ error: 'Invalid plugin' }), {
      status: 401,
    })
  }

  const authenticated = await authenticate({
    message: hash,
    signature: sig,
    previousConfiguration,
    provider: providers.getDefaultProvider(
      decode(previousConfiguration).rpcUrl
    ),
  })

  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
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
