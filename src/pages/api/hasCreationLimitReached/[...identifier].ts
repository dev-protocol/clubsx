import { hasCreationLimitReached } from './util'
import { headers } from '@fixtures/api/headers'

export const GET = async ({
  params: { identifier },
}: {
  params: { identifier: string | undefined }
}) => {
  if (!identifier) {
    return new Response(
      JSON.stringify({ error: 'No user identifier passed' }),
      {
        status: 401,
      },
    )
  }

  const isCreationLimitReached: boolean =
    await hasCreationLimitReached(identifier)
  return new Response(JSON.stringify({ isCreationLimitReached }), {
    status: 200,
    headers,
  })
}
