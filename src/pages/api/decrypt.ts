import { authenticate, decode } from '@devprotocol/clubs-core'
import { providers } from 'ethers'
import jsonwebtoken from 'jsonwebtoken'

export const post = async ({ request }: { request: Request }) => {
  const { encryptedText, hash, sig, configuration } =
    (await request.json()) as {
      configuration: string
      encryptedText: string
      hash?: string
      sig?: string
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
    previousConfiguration: configuration,
    provider: providers.getDefaultProvider(decode(configuration).rpcUrl),
  })

  if (!authenticated) {
    return new Response(JSON.stringify({}), { status: 401 })
  }

  let decoded = jsonwebtoken.verify(encryptedText, process.env.SALT ?? '')

  return new Response(
    JSON.stringify({
      decoded,
    }),
    { status: 200 }
  )
}
