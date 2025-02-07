import { whenDefined, whenNotError } from '@devprotocol/util-ts'
import { cache, headers } from '@fixtures/api/headers'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ url }): Promise<Response> => {
  const queryUrl = url.searchParams.get('link')

  const redirectedURL = await whenNotError(
    queryUrl,
    (q: string | null) =>
      whenDefined(q, (_q) =>
        fetch(_q)
          .then((res) => {
            return res?.url || queryUrl || ''
          })
          .catch((err) => {
            return queryUrl || ''
          }),
      ) ??
      (queryUrl || ''),
  )

  return new Response(
    JSON.stringify(
      redirectedURL instanceof Error
        ? { url: queryUrl || '' }
        : { url: redirectedURL },
    ),
    {
      status: 200,
      headers: { ...headers, ...cache({ maxAge: 604800 }) },
    },
  )
}
