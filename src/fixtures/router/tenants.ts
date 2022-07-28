import { tenants } from '@constants/tenants'

export function getStaticPaths() {
  return tenants.map(({ id }) => ({ params: { site: id } }))
}
