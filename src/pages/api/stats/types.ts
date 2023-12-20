import type { ClubsConfiguration } from '@devprotocol/clubs-core'

export type Club = Omit<ClubsConfiguration, 'options' | 'plugins'> & {
  draft: boolean
}

export type ClubWithStats = Club & {
  stats: {
    members: number
  }
}

export type Stats = {
  lastUpdate: string
  clubs: ClubWithStats[]
  uniqueCreators: number
  published: number
  unpublished: number
  publishedClubsMembers: number
}
