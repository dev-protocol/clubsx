import { authenticate, decode } from '@devprotocol/clubs-core'
import { getDefaultProvider } from 'ethers'
import jsonwebtoken from 'jsonwebtoken'
import { createClient } from 'redis'

export const post = async ({ request }: { request: Request }) => {
  const { encryptedText, hash, sig, site } = (await request.json()) as {
    site: string
    encryptedText: string
    hash?: string
    sig?: string
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

  // We need either hash and sig
  const hashAndSignGiven = !!hash && !!sig
  if (!hashAndSignGiven) {
    return new Response(JSON.stringify({ error: 'No hash or sig given' }), {
      status: 401,
    })
  }

  const authenticated = await authenticate({
    message: hash,
    signature: sig,
    previousConfiguration,
    provider: getDefaultProvider(decode(previousConfiguration).rpcUrl),
  })

  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
  }

  let decoded = jsonwebtoken.verify(encryptedText, process.env.SALT ?? '')

  return new Response(
    JSON.stringify({
      decoded,
    }),
    { status: 200 },
  )
}
