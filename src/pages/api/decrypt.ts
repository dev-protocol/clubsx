import { authenticate, decode } from '@devprotocol/clubs-core'
import { providers } from 'ethers'
import { verify } from 'jsonwebtoken'
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
    console.log('no previous config')
    return new Response(JSON.stringify({ error: 'Encoded config not found' }), {
      status: 401,
    })
  }

  // We need either signautre or firebase jwt token to authenticate the draft.
  const hashAndSignGiven = !!hash && !!sig
  const jwtIdTokenGiven = !!request.headers.has('authorization')
  if (!hashAndSignGiven && !jwtIdTokenGiven) {
    console.log('!hashAndSignGiven && !jwtIdTokenGiven')
    return new Response(JSON.stringify({ error: 'Auth failed' }), {
      status: 401,
    })
  }

  console.log('hash is: ', hash)
  console.log('sig is: ', sig)
  console.log('previous config is: ', decode(previousConfiguration).rpcUrl)

  const authenticated = await authenticate({
    message: hash ?? '',
    signature: sig ?? '',
    previousConfiguration,
    provider: providers.getDefaultProvider(
      decode(previousConfiguration).rpcUrl
    ),
  })

  console.log('authenticated is: ', authenticated)

  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
  }

  let decoded = verify(encryptedText, process.env.SALT ?? '')

  return new Response(
    JSON.stringify({
      decoded,
    }),
    { status: 200 }
  )
}
