import { type } from "ramda"


export type propertyAddressType = {
  readonly propertyAddress: string
}
export type Image = {
  readonly imageSrc?: string
  readonly requiredETHAmount?: number
  readonly requiredETHFee?: number
  readonly gateway?: string
}
export type keysType = {
  readonly key: string
}