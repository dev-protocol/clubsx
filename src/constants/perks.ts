import type { Tier } from '@devprotocol/clubs-core'

export type Perk = Readonly<{
  tier: Tier['id']
  descriptions: ReadonlyArray<{ lang: 'en_US' | 'ja_JP'; description: string }>
}>

export type Perks = ReadonlyArray<Perk>
