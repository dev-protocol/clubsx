type currencyType = {
  readonly DEV: 'DEV'
  readonly ETH: 'ETH'
}

export type setImagesProps = {
  readonly id?: string
  readonly name?: string
  readonly description?: string
  readonly price?: number
  readonly currency?: currencyType
  readonly imageSrc?: string
  readonly payload?: Uint8Array
  readonly fee?: {
    readonly percentage: number
    readonly beneficiary: string
  }
}
