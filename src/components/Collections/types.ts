import type { CollectionMembership } from '@plugins/collections'

export type SlotLeft = {
  left: number
  total: number
}

export type State = {
  [key: string]: string | bigint | number
}
export type ExpectedStatus = {
  payload: string
  source: CollectionMembership
  isTimeLimitedCollection: boolean
  state: State
}
