import { getDefaultClient } from '@fixtures/api/club/redis'
import { authenticate, decode } from '@devprotocol/clubs-core'
import { isNotError, whenDefined, whenNotError } from '@devprotocol/util-ts'
import { json } from '@fixtures/api/json'
import { headers } from '@fixtures/api/headers'
import { getDefaultProvider } from 'ethers'

export const POST = async ({ request }: { request: Request }) => {
  const { message, signature, site } = (await request.json()) as {
    site: string
    message: string
    signature: string
  }

  const client = await getDefaultClient()

  const config = await client.get(site)
  const authenticated =
    (await whenDefined(config, (previousConfiguration) =>
      authenticate({
        message,
        signature,
        previousConfiguration,
        provider: getDefaultProvider(decode(previousConfiguration).rpcUrl),
      }),
    )) ?? new Error('Specified Club is not defined.')

  const res = whenNotError(authenticated, (_auth) =>
    _auth ? _auth : new Error('Unauthorized'),
  )

  return isNotError(res)
    ? new Response(
        json({
          authenticated: res,
        }),
        { status: 200, headers },
      )
    : new Response(json({ error: res.message }), {
        status: 401,
        headers,
      })
}
