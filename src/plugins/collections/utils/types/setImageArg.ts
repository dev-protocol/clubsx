// https://github.com/dev-protocol/dynamic-s-tokens-simple-collections/blob/main/contracts/SimpleCollections.sol#L11-L16
export type Image = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly deadline?: number | string
  readonly slots?: number | string
  readonly requiredTokenAmount?: number | string | bigint
  readonly requiredTokenFee?: number | string | bigint
  readonly gateway?: string
}


export type MixImage = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly slots?: [string | number | bigint , string | number | bigint]
  readonly requiredTokenAmount?: number | string | bigint
  readonly requiredTokenFee?: number | string | bigint
  readonly gateway?: string
}
