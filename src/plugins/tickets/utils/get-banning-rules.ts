import type { ClubsPluginOptions } from '@devprotocol/clubs-core'
import type { UndefinedOr } from '@devprotocol/util-ts'

export type BanningRules = {
  id: number[]
}

export const getBanningRules = (options: ClubsPluginOptions): BanningRules => {
  const id =
    (options?.find((opt) => opt.key === 'banId')?.value as UndefinedOr<
      number[]
    >) ?? []
  return { id }
}
