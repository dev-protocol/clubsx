import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import { expirationDatetime, isExpiredNow } from './date'
import type { Dayjs } from 'dayjs'

export type StatusUnit = {
  use: Ticket['uses'][0]
  history?: TicketHistory
  unused: boolean
  expired?: boolean
  expiration?: Dayjs
  refreshed?: boolean
}

export type TicketStatus = {
  available: boolean
  enablable: boolean
  self: StatusUnit
  dependency?: StatusUnit
}

export const factory =
  (_history: TicketHistories) =>
  (use: Ticket['uses'][0]): StatusUnit => {
    const history = use.id in _history ? _history[use.id] : undefined
    const refreshingExpiration = whenDefinedAll(
      [history, use.refreshCycle],
      ([h, ex]) => expirationDatetime(h.datetime, ex.end, ex.duration, ex.tz),
    )
    const expiration =
      whenDefinedAll([history, use.expiration], ([h, ex]) =>
        expirationDatetime(h.datetime, ex.end, ex.duration, ex.tz),
      ) ?? refreshingExpiration
    const refreshed = whenDefined(refreshingExpiration, isExpiredNow)
    const unused = refreshed ?? history === undefined
    const expired = whenDefined(expiration, (exp) => isExpiredNow(exp))
    return {
      use,
      history,
      unused,
      expired,
      expiration,
      refreshed,
    }
  }

export const ticketStatus = (
  history: TicketHistories,
  uses: Ticket['uses'],
): TicketStatus[] => {
  const getStatus = factory(history)

  return uses.map((use) => {
    const _self = getStatus(use)
    console.log({ _self })
    const dependency = whenDefined(use.dependsOn, (dep) =>
      whenDefined(
        uses.find((u) => u.id === dep),
        getStatus,
      ),
    )
    console.log({ dependency })
    const self =
      whenDefined(dependency, ({ expired, expiration }) =>
        expired === true ? { ..._self, expired, expiration } : _self,
      ) ?? _self // If there is a dependency and its `expired` is true, it inherits the dependency's `expired`.
    const available = self.expired === false || self.refreshed === false

    const enablable = dependency
      ? dependency.expired == false && self.unused
      : self.expired === undefined

    return {
      available,
      enablable,
      self,
      dependency,
    }
  })
}
