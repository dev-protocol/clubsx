// TODO: This should be managed by a something data-store

export type Tenant = Readonly<{
  id: string
  name: string
}>

export type Tenants = ReadonlyArray<Tenant>

export const tenants: Tenants = [
  {
    id: 'my-domain',
    name: 'My Name',
  },
] as const
