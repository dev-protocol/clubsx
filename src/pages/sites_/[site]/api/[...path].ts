import { apiFactory, decode } from '@devprotocol/clubs-core'
import { config as _config } from '@fixtures/config'
import { plugins } from '@constants/plugins'
import type { APIRoute } from 'astro'
import { replaceUrlConfigWithLocal } from '@fixtures/url'

export const ALL: APIRoute = async (event) => {
  const { params } = event
  const siteconfig = await _config(params.site)

  if (!siteconfig) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    })
  }

  const config = async () =>
    replaceUrlConfigWithLocal(
      decode(siteconfig),
      new URL(event.request.url),
      params.site,
    )

  const { ALL } = apiFactory({
    config,
    plugins,
  })

  return ALL(event)
}
