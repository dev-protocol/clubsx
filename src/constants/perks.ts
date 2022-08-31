import { Tier } from './tier'

export type Perk = Readonly<{
  tier: Tier['id']
  descriptions: ReadonlyArray<{ lang: 'en_US' | 'ja_JP'; description: string }>
}>

export type Perks = ReadonlyArray<Perk>
