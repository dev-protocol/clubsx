import type { APIRoute } from 'astro'
import { Prefix, invitationDocument } from '../redis-schema'
import { getDefaultClient } from '../redis'
import {
  authenticate,
  type ClubsConfiguration,
  encode,
} from '@devprotocol/clubs-core'
import { getDefaultProvider } from 'ethers'

const checkExisting = async ({ invitationId }: { invitationId: string }) => {
  const client = await getDefaultClient()

  const keyExists = await client.exists(`${Prefix.Invitation}::${invitationId}`)

  return keyExists === 1 ? true : false
}

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    console.log('creating invitation')

    const { membership, conditions, signature, message, site } =
      (await request.json()) as {
        membership: {
          payload: string
        }
        conditions?: {
          recipient?: string
        }
        signature: string
        message: string
        site: string
      }

    const client = await getDefaultClient()

    const authenticated = await authenticate({
      message,
      signature,
      previousConfiguration: encode(conf),
      provider: getDefaultProvider(conf.rpcUrl),
    })

    if (!authenticated) {
      return new Response(JSON.stringify({}), { status: 401 })
    }

    const invitation = invitationDocument({
      membership,
      conditions,
    })

    if (await checkExisting({ invitationId: invitation.id })) {
      return new Response(
        JSON.stringify({ error: 'invitation already exists' }),
        { status: 400 },
      )
    }

    await client.set(
      `${Prefix.Invitation}::${invitation.id}`,
      JSON.stringify(invitation),
    )

    console.log('Invitation created:', invitation.id)

    return new Response(JSON.stringify({ id: invitation.id }), { status: 200 })
  }

export default handler
