export type NumberAttribute = {
  trait_type: string
  display_type: string
  value: string
}

export type StringAttribute = {
  trait_type: string
  value: string
}

export type Achievement = {
  id: string
  contract: string
  metadata: {
    name: string
    description: string
    image: string
    numberAttributes: NumberAttribute[]
    stringAttributes: StringAttribute[]
  }
  account: string
  claimed: boolean
  claimedSBTTokenId: number
  createdOnTimestamp: number
  claimedOnTimestamp: number
}

export type ClaimAchievementApiHandlerParams = {
  rpcUrl: string
  chainId: number
  property: string
}
