export type Tier = Readonly<{
  title: string
  id: string
  amount: number | string
  badgeImageSrc?: string
}>

export type Tiers = ReadonlyArray<Tier>

export const tiers: Tiers = [
  {
    title: 'Silver',
    id: 'silver',
    amount: 100,
  },
  {
    title: 'Bronze',
    id: 'bronze',
    amount: 1000,
  },
  {
    title: 'Gold',
    id: 'gold',
    amount: 10000,
  },
] as const
