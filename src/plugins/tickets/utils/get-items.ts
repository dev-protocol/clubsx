import type { ClubsPluginOptions } from '@devprotocol/clubs-core'
import type { Tickets } from '..'
import type { UndefinedOr } from '@devprotocol/util-ts'

export const getItems = (options: ClubsPluginOptions): Tickets => {
  const tickets =
    (options?.find((opt) => opt.key === 'tickets')
      ?.value as UndefinedOr<Tickets>) ?? []
  return tickets
}
