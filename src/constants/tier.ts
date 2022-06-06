export type Tier = Readonly<{
  title: string
  id: string
  amount: number | string
  badgeImageDescription?: string
  badgeImageSrc?: string
}>

export type Tiers = ReadonlyArray<Tier>

export const tiers: Tiers = [
  {
    title: 'Bronze',
    id: 'bronze',
    amount: 400,
    badgeImageDescription: `"Yasuragi dan Renge (a Buddhist altar, lotus)" embossed gilt lacquer work with inlaid mother-of-pearl`,
  },
  {
    title: 'Silver',
    id: 'silver',
    amount: 4000,
    badgeImageDescription: `"Yasuragi dan Koki (a Buddhist altar, brightness)" embossed gilt lacquer work`,
  },
  {
    title: 'Gold',
    id: 'gold',
    amount: 10000,
    badgeImageDescription: `Sojiij Head Monastry : Nioh statue (statues of the two Deva kings)`,
  },
  {
    title: 'Super',
    id: 'super',
    amount: 15000,
    badgeImageDescription: `Gokokuji= Head Monastry : Nyoirin Kannon statue (Cintāmaṇicakra statue)`,
  },
] as const
