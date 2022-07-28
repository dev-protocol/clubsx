import { tenants } from '@constants/tenants'

export const tenantBy = ({ params: { site } }: { params: { site: string } }) =>
  tenants.find(({ id }) => id === site)
