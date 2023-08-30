// https://github.com/dev-protocol/dynamic-s-tokens-simple-collections/blob/main/contracts/SimpleCollections.sol#L11-L16
export type Image = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly deadline?: number | string
  readonly slots?: number | string
  readonly requiredETHAmount?: number | string
  readonly requiredETHFee?: number | string
  readonly gateway?: string
}
