import type { APIRoute } from 'astro'
import { whenDefined, whenNotError } from '@devprotocol/util-ts'

import { json } from '@fixtures/api/json'
import { headers } from '@fixtures/api/headers'
import { getPassportItemForPayload } from '@fixtures/api/passportItem'

export const GET: APIRoute = async ({ params }) => {
  const props =
    whenDefined(params.sTokenPayload, (sTokenPayload) => ({ sTokenPayload })) ??
    new Error('/passportItem/[sTokenPayload]/ is required')

  const result = await whenNotError(props, (params) =>
    getPassportItemForPayload(params)
      .then((item) => item)
      .catch((err) => new Error(err)),
  )

  return result instanceof Error
    ? new Response(json({ content: null, message: result.message }), {
        status: 400,
        headers,
      })
    : new Response(json({ content: result, message: 'success' }), {
        status: 200,
        headers,
      })
}
