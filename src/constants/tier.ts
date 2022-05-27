export type Tier = Readonly<{
  title: string
  id: string
  amount: number | string
  badgeImageSrc: string
}>

export type Tiers = ReadonlyArray<Tier>

export const tiers: Tiers = [
  {
    title: 'Silver',
    id: 'silver',
    amount: 100,
    badgeImageSrc: '/assets/badge1.png',
  },
  {
    title: 'Bronze',
    id: 'bronze',
    amount: 1000,
    badgeImageSrc: '/assets/badge2.png',
  },
  {
    title: 'Gold',
    id: 'gold',
    amount: 10000,
    badgeImageSrc: '/assets/badge3.png',
  },
] as const
