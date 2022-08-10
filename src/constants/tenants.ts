// TODO: This should be managed by a something data-store

export type Tenant = Readonly<{
  id: string
  name: string
  url: string
  description: string
  twitterHandle: string
  propertyAddress: string
}>

export type Tenants = ReadonlyArray<Tenant>

export const tenants: Tenants = [
  {
    id: 'my-domain',
    name: 'My Name',
    url: 'https://my-dao.example.com',
    description: '',
    twitterHandle: '',
    propertyAddress: '0x1E09dcf341c62e2Ea155dA247ecB94627AA0bcaf',
  },
] as const
