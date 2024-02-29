import type { APIRoute } from 'astro'
import { Prefix, invitationDocument } from '../redis-schema'
import { getDefaultClient } from '../redis'

const checkExisting = async ({ invitationId }: { invitationId: string }) => {
  const client = await getDefaultClient()

  const keyExists = await client.exists(`${Prefix.Invitation}::${invitationId}`)

  return keyExists === 1 ? true : false
}

export const POST: APIRoute = async ({ request }) => {
  const { membership, conditions } = (await request.json()) as {
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

  if (await checkExisting({ invitationId: invitation.id })) {
    return new Response(
      JSON.stringify({ error: 'invitation already exists' }),
      { status: 400 },
    )
  }

  client.set(
    `${Prefix.Invitation}::${invitation.id}`,
    JSON.stringify(invitation),
  )

  return new Response(JSON.stringify({ id: invitation.id }), { status: 200 })
}
