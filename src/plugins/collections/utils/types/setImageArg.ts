// https://github.com/dev-protocol/dynamic-s-tokens-simple-collections/blob/main/contracts/SimpleCollections.sol#L11-L16
export type Image = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly deadline?: number | string | bigint
  readonly members?: number | string | bigint
  readonly requiredTokenAmount?: number | string | bigint
  readonly requiredTokenFee?: number | string | bigint
  readonly gateway?: string
}
