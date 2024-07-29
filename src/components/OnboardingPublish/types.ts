export type CreatorPlatform = 'youtube' | 'discord' | 'github' | undefined

export type MarketAddressOptions = {
  github: string
  youtube: string
  discord: string
}

export enum Market {
  GITHUB = 'GITHUB',
  YOUTUBE = 'YOUTUBE',
  DISCORD = 'DISCORD',
  INVALID = 'INVALID',
}
