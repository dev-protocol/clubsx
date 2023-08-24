import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import { formatDuration, isExpired, period } from './date'
import type { Duration } from 'dayjs/plugin/duration'
import type { Dayjs } from 'dayjs'

export type StatusUnit = {
  use: Ticket['uses'][0]
  history?: TicketHistory
  unused: boolean
  duration?: Duration
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
    const duration = whenDefined(use.duration, (duration) =>
      formatDuration(duration),
    )
    const refreshDuration = whenDefined(use.refreshCycle, (refreshCycle) =>
      formatDuration(refreshCycle),
    )
    const refreshed = whenDefinedAll(
      [history, refreshDuration],
      ([his, refresh]) => isExpired(his.datetime, refresh),
    )
    const unused = refreshed ?? history === undefined
    const expired =
      whenDefinedAll([history, duration], ([h, d]) =>
        isExpired(h.datetime, d),
      ) ??
      whenDefinedAll([history, refreshDuration], ([h, d]) =>
        isExpired(h.datetime, d),
      )
    console.log(use.id, history?.datetime, duration, refreshDuration)
    const expiration =
      whenDefinedAll([history, duration], ([h, d]) => period(h.datetime, d)) ??
      whenDefinedAll([history, refreshDuration], ([h, d]) =>
        period(h.datetime, d),
      )
    return {
      use,
      history,
      unused,
      duration,
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
    const dependency = whenDefined(use.dependsOn, (dep) =>
      whenDefined(
        uses.find((u) => u.id === dep),
        getStatus,
      ),
    )
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
