import tenants from '../../tenants'

export const config = (site: string | number | undefined): string =>
  tenants[site as keyof typeof tenants]
