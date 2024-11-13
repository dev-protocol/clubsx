import type { APIContext } from 'astro'
import { json } from '@fixtures/api/json'
import { getProfile } from '@fixtures/api/profile'
import { headers, cache } from '@fixtures/api/headers'

export const GET = async ({
  params: { id },
  url,
}: {
  params: { id: string | undefined }
  url: APIContext['url']
}) => {
  if (!id) {
    return new Response(JSON.stringify({ error: 'No profile ID passed' }), {
      status: 401,
    })
  }
  const noCache = url.searchParams.get('nocache') === 'true' ? true : false

  const profile = await getProfile({ id })

  return new Response(json(profile), {
    status: 200,
    headers: { ...headers, ...cache({ maxAge: noCache ? 0 : 30 }) },
  })
}
