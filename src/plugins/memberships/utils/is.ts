import type { Membership, UnpricedMembership, PricedMembership } from '..'

export const isUnpriced = (m: Membership): m is UnpricedMembership => {
  return typeof m.price === 'undefined' && typeof m.currency === 'undefined'
}
export const isPriced = (m: Membership): m is PricedMembership => {
  return typeof m.price !== 'undefined' && typeof m.currency !== 'undefined'
}
