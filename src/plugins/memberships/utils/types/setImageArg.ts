// https://github.com/dev-protocol/dynamic-s-tokens-simple-collections/blob/main/contracts/SimpleCollections.sol#L11-L16
export type Image = {
  readonly src?: string
  readonly requiredETHAmount?: number | string
  readonly requiredETHFee?: number | string
  readonly gateway?: string
}
