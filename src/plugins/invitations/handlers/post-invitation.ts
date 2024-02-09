import type { APIRoute } from 'astro'
import { Prefix, invitationDocument } from '../redis-schema'
import { getDefaultClient } from '../redis'

export const POST: APIRoute = async ({ request }) => {
  const { signature, message, membership, conditions } =
    (await request.json()) as {
      signature: string
      message: string
      membership: {
        payload: string
      }
      conditions?: {
        recipient?: string[]
      }
    }

  // Generate a redis client while checking the latest schema is indexing and create/update index if it's not.
  const client = await getDefaultClient()

  const invitation = invitationDocument({
    membership,
    conditions,
  })

  client.set(
    `${Prefix.Invitation}::${invitation.id}`,
    JSON.stringify(invitation),
  )

  return new Response(JSON.stringify({ id: invitation.id }), { status: 200 })
}
