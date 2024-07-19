export type NumberAttribute = {
  trait_type: string
  display_type: string
  value: string
}

export type StringAttribute = {
  trait_type: string
  value: string
}

export type AchievementInfo = {
  id: string
  contract: string
  metadata: {
    name: string
    description: string
    image: string
    numberAttributes: NumberAttribute[]
    stringAttributes: StringAttribute[]
  }
}

export type AchievementItem = {
  id: string
  achievementInfoId: string
  achievementDistId: string
  account: string
  claimedSBTTokenId: number
  claimedOnTimestamp: number
  clubsUrl: string
}

export type AchievementDist = {
  id: string
  achievementInfoId: string
  conditions: {
    recipients?: string[]
    maxRedemptions?: number
  }
  createdOnTimestamp: number
  clubsUrl: string
}

export type Achievement = AchievementInfo & AchievementDist

export type ClaimAchievementApiHandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
  url: string
}
