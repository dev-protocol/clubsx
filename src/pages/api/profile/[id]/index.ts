import { headers, cache } from '@fixtures/api/headers'
import { getProfile } from '@fixtures/api/profile'
import { json } from '@fixtures/api/json'

export const GET = async ({
  params: { id },
}: {
  params: { id: string | undefined }
}) => {
  if (!id) {
    return new Response(JSON.stringify({ error: 'No profile ID passed' }), {
      status: 401,
    })
  }

  const profile = await getProfile({ id })

  return new Response(json(profile), {
    status: 200,
    headers: { ...headers, ...cache({ maxAge: 30 }) },
  })
}
