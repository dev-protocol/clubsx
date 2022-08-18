import tenants from '../../tenants.json'
import { Tenant } from '../constants/tenants'

export const config = (site: string): Tenant =>
  tenants[site as keyof typeof tenants]
