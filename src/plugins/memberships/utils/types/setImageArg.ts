// https://github.com/dev-protocol/dynamic-s-tokens-simple-collections/blob/main/contracts/SimpleCollections.sol#L11-L16
export type Image = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly requiredETHAmount?: number | string
  readonly requiredETHFee?: number | string
  readonly gateway?: string
}

export type ERC20Image = {
  readonly src?: string
  readonly name?: string
  readonly description?: string
  readonly requiredTokenAmount?: number | string | bigint
  readonly requiredTokenFee?: number | string | bigint
  readonly gateway?: string
  readonly token?: string
}
