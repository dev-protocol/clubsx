import type { Membership } from '@plugins/memberships'

export type MembershipOption = {
  name: string
  imagePath: string
  ethPrice: string
  description: string
}
export type State = {
  [key: string]: string | bigint | number
}
export type ExpectedStatus = {
  payload: string
  source: Membership
  state: State
}
