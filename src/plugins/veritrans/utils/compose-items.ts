import type {
  ClubsFactoryUtils,
  ClubsPluginOptions,
} from '@devprotocol/clubs-core'
import type { ComposedItem, Override } from '..'
import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'
import type { Membership } from '@plugins/memberships'

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
      )?.find(
        (mem) => JSON.stringify(mem.payload) === JSON.stringify(ov.payload),
      )
      const composed = whenDefined(source, (so) => ({ ...ov, source: so }))
      return composed
    })
    .filter((x) => x !== undefined) as ComposedItem[]

  return items
}
