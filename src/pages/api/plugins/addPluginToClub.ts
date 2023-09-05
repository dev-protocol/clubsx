import { getDefaultProvider } from 'ethers'
import { createClient } from 'redis'

import {
  authenticate,
  ClubsConfiguration,
  decode,
  encode,
} from '@devprotocol/clubs-core'
import { InstallablePlugins, installablePlugins } from '@constants/plugins'

export const POST = async ({ request }: { request: Request }) => {
  const { site, pluginId, sig, hash } = (await request.json()) as {
    sig: string
    site: string
    hash: string
    pluginId: string
  }

  // We need hash and signature and also club and plugin id.
  const hashAndSignGiven = !!hash && !!sig
  if (!hashAndSignGiven || !pluginId || !site) {
    return new Response(
      JSON.stringify({ error: 'Invalid request: missing required params' }),
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

  const previousConfiguration = await client.get(site)
  if (!previousConfiguration) {
    return new Response(JSON.stringify({ error: 'Encoded config not found' }), {
      status: 401,
    })
  }

  const decodedPreviousConfiguration = decode(previousConfiguration)

  // The plugin id should be in the list of installable plugins.
  const isPluginInstallable = installablePlugins.find(
    (ip: InstallablePlugins) => ip.id === pluginId,
  )
  if (!isPluginInstallable) {
    return new Response(JSON.stringify({ error: 'Invalid plugin' }), {
      status: 401,
    })
  }

  // To avoid adding the plugin, if it's already present in clubs config.
  const isPluginAlreadyAdded = decodedPreviousConfiguration.plugins.find(
    (plugin) => plugin.id === pluginId,
  )
  if (isPluginAlreadyAdded) {
    return new Response(JSON.stringify({ error: 'Plugin already added' }), {
      status: 401,
    })
  }

  const authenticated = await authenticate({
    message: hash,
    signature: sig,
    previousConfiguration,
    provider: getDefaultProvider(decodedPreviousConfiguration.rpcUrl),
  })

  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
  }

  const newConfiguration: ClubsConfiguration = {
    ...decodedPreviousConfiguration,
    plugins: [
      ...decodedPreviousConfiguration.plugins.filter(
        (plugin) => plugin.id !== pluginId,
      ), // Fail safe to avoid adding same plugins twice.
      {
        id: isPluginInstallable.id,
        enable: true,
        options: isPluginInstallable.pluginOptions,
      },
    ],
  }

  try {
    // Add the new plugin to the response.
    await client.set(site, encode(newConfiguration))
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
