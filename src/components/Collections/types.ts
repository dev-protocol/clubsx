import type { CollectionMembership } from '@plugins/collections'

export type SlotLeft = {
  left: number
  total: number
}

export type State = {
  [key: string]: string | bigint | number | bigint[] | undefined
}
export type ExpectedStatus = {
  payload: string
  source: CollectionMembership
  state: State
}
