import { Prefix, invitationDocument } from '../redis-schema'
import { getDefaultClient } from '../redis'
import {
  authenticate,
  type ClubsConfiguration,
  encode,
  bytes32Hex,
} from '@devprotocol/clubs-core'
import { getDefaultProvider } from 'ethers'
import { headers } from '@fixtures/api/headers'

const checkExisting = async ({ invitationId }: { invitationId: string }) => {
  const client = await getDefaultClient()

  const keyExists = await client.exists(`${Prefix.Invitation}::${invitationId}`)

  return keyExists === 1 ? true : false
}

export const handler =
  (conf: ClubsConfiguration) =>
  async ({ request }: { request: Request }) => {
    console.log('create invitation hit')
    const { membership, conditions, signature, message } =
      (await request.json()) as {
        membership: {
          payload: string
        }
        conditions?: {
          recipients?: string[]
        }
        signature: string
        message: string
      }

    const client = await getDefaultClient()

    console.log('got default client')

    const authenticated = await authenticate({
      message,
      signature,
      previousConfiguration: encode(conf),
      provider: getDefaultProvider(conf.rpcUrl),
    })

    if (!authenticated) {
      return new Response(JSON.stringify({ message: 'unauthenticated' }), {
        status: 401,
      })
    }

    const invitation = invitationDocument({
      membership: {
        payload: membership.payload,
      },
      conditions,
    })

    console.log('invitation is: ', invitation)

    if (await checkExisting({ invitationId: invitation.id })) {
      return new Response(
        JSON.stringify({ error: 'invitation already exists' }),
        { status: 400 },
      )
    }

    await client.json.set(
      `${Prefix.Invitation}::${invitation.id}`,
      '$',
      invitation,
    )

    await client.quit()

    return new Response(JSON.stringify({ id: invitation.id }), {
      status: 200,
      headers,
    })
  }

export default handler
