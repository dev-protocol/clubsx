import {
  bytes32Hex,
  type ClubsFactoryUtils,
  type ClubsPluginOptions,
} from '@devprotocol/clubs-core'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'

import type { ComposedItem, Override } from '..'
import type { Membership } from '@plugins/memberships'
import type { Collection, CollectionMembership } from '@plugins/collections'

export const composeItems = (
  options: ClubsPluginOptions,
  { getPluginConfigById }: ClubsFactoryUtils,
): ComposedItem[] => {
  const overrides =
    (options.find((opt) => opt.key === 'override')?.value as UndefinedOr<
      Override[]
    >) ?? []

  const items: ComposedItem[] = overrides
    .map((ov) => {
      const [sourceConfig] = getPluginConfigById(ov.importFrom)
      const source = (
        sourceConfig?.options?.find((op) => op.key === ov.key)?.value as
          | undefined
          | Membership[]
          | Collection[]
      )?.find((s) => {
        // Check if the keys from collection object are present in s, if yes then it's a collection.
        return 'memberships' in s ||
          'requiredMemberships' in s ||
          'endTime' in s
          ? !!(s as Collection).memberships.find( // This is a collection, so find the membership and return boolean.
              (m) => bytes32Hex(m.payload) === bytes32Hex(ov.payload),
            )
          : bytes32Hex(s.payload) === bytes32Hex(ov.payload) // This is a membership so directly compare payload.
      })
      const composed = whenDefined(source, (so) => ({ ...ov, source: so }))
      return composed
    })
    .filter((x) => x !== undefined) as ComposedItem[]

  return items
}
