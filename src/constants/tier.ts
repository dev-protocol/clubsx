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
    amount: 400,
  },
  {
    title: 'Bronze',
    id: 'bronze',
    amount: 4000,
  },
  {
    title: 'Gold',
    id: 'gold',
    amount: 20000,
  },
  {
    title: 'Super',
    id: 'super',
    amount: 80000,
  },
] as const
