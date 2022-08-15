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
    id: 'temples',
    name: 'TemplesDAO',
    twitterHandle: '@templesdao',
    description: 'DAO that makes the next 1000 years',
    url: 'https://temples.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
  },
  {
    id: 'kogenji',
    name: 'Kogenji',
    twitterHandle: '@templesdao',
    description: '',
    url: 'https://kogenji.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
  },
] as const
