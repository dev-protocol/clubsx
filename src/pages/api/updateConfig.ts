import { authenticate, decode } from '@devprotocol/clubs-core'
import { providers } from 'ethers'
import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash } = (await request.json()) as {
    site: string
    config: string
    hash: string
    sig: string
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

  const isInDraft = decode(config).options?.some(
    (x) =>
      x.key === '__draft' &&
      (
        x.value as {
          isInDraft: boolean
        }
      ).isInDraft === true
  )

  const authenticated = isInDraft
    ? true
    : await authenticate({
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
    await client.set(site, config)
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
