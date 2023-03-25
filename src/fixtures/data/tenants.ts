import { tenants } from '@constants/tenants'
import type { Params } from 'astro'

export const tenantBy = (params: Params) => {
  const { site } = params
  return tenants.find(({ id }) => id === site)
}
