import { apiFactory } from '@devprotocol/clubs-core'
import { config as _config } from '@fixtures/config'
import { plugins } from '@constants/plugins'
import type { APIRoute } from 'astro'

export const ALL: APIRoute = async (event) => {
  const { params } = event

  const config = () => _config(params.site)

  const { all } = apiFactory({
    config,
    plugins,
  })

  return all(event)
}
