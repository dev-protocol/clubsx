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
  account: string
  claimed: boolean
  claimedSBTTokenId: number
  createdOnTimestamp: number
  claimedOnTimestamp: number
  clubsUrl: string
}

export type Achievement = AchievementInfo & AchievementItem

export type ClaimAchievementApiHandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
  url: string
}
