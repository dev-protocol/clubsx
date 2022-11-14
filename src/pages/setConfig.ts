import { authenticate } from '@devprotocol/clubs-core'
import { providers } from 'ethers'
import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash } = (await request.json()) as {
    site: string
    config: string
    hash: string
    sig: string
  }

  // TODO: use this
  // const provider = providers.getDefaultProvider(
  //   import.meta.env.PUBLIC_WEB3_PROVIDER_URL
  // )

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

  // TODO: use this
  // const authenticated = await authenticate({
  //   message: hash,
  //   signature: sig,
  //   previousConfiguration,
  //   provider,
  // })
  // TODO: use this
  // if (!authenticated) {
  //   return new Response(JSON.stringify({}), { status: 401 })
  // }

  try {
    await client.set(site, config)
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
