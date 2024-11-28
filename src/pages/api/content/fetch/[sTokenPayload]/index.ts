import {
  isNotError,
  whenDefined,
  whenNotError,
  whenNotErrorAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import { type APIRoute } from 'astro'
import {
  getContentByPayloadLatest,
  withCheckingIndex,
  getDefaultClient,
} from '../../db/redis'

export const GET: APIRoute = async (req) => {
  const sTokenPayload =
    whenDefined(req.params.sTokenPayload, (sTokenPayload) => sTokenPayload) ??
    new Error('No sTokenPayload passed')
  const client = await withCheckingIndex(getDefaultClient)
  const content = await whenNotError(sTokenPayload, (sTokenPayload) =>
    getContentByPayloadLatest(sTokenPayload, client),
  )
  await client.quit()
  if (content instanceof Error) {
    return new Response(JSON.stringify({ error: 'Error' }), {
      status: 500,
    })
  }
  return content === undefined
    ? new Response(JSON.stringify({ error: 'No content found' }), {
        status: 404,
      })
    : new Response(JSON.stringify(content), {
        status: 200,
      })
}
