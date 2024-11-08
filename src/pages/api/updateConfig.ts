import { authenticate, decode } from '@devprotocol/clubs-core'
import {
  updateClubId,
  withCheckingIndex,
  getDefaultClient,
} from '@fixtures/api/club/redis'
import { getDefaultProvider } from 'ethers'
import { createClient } from 'redis'
import { clubsUrlToKeccak256Tag } from '@plugins/achievements/utils'

export const POST = async ({ request }: { request: Request }) => {
  const { site, config, sig, hash } = (await request.json()) as {
    site: string
    config: string
    hash: string
    sig: string
  }

  const client = await withCheckingIndex(getDefaultClient)

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
      ).isInDraft === true,
  )

  const authenticated = isInDraft
    ? true
    : await authenticate({
        message: hash,
        signature: sig,
        previousConfiguration,
        provider: getDefaultProvider(decode(previousConfiguration).rpcUrl),
      })

  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 401,
    })
  }

  try {
    await client.set(site, config)
    await updateClubId(
      {
        id: site,
        propertyAddress: decode(config).propertyAddress,
        clubsUrlHash: clubsUrlToKeccak256Tag(decode(config).url),
      },
      client,
    )
    await client.quit()
    return new Response(JSON.stringify({}), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
