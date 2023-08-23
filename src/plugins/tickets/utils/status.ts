import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistory } from '..'
import { formatDuration, isExpired, period } from './date'
import type { Duration } from 'dayjs/plugin/duration'
import type { Dayjs } from 'dayjs'

export type StatusUnit = {
  use: Ticket['uses'][0]
  history?: TicketHistory[0]
  unused: boolean
  available: boolean
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
  (his: TicketHistory) =>
  (use: Ticket['uses'][0]): StatusUnit => {
    const history = his.find((h) => h.id === use.id)
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
    const expired = whenDefinedAll([history, duration], ([h, d]) =>
      isExpired(h.datetime, d),
    )
    const expiration = whenDefinedAll([history, duration], ([h, d]) =>
      period(h.datetime, d),
    )
    const available =
      typeof expired === 'boolean'
        ? !expired
        : typeof refreshed === 'boolean'
        ? !refreshed
        : false
    console.log({
      use,
      history,
      unused,
      duration,
      expired,
      expiration,
      refreshed,
      available,
    })
    return {
      use,
      history,
      unused,
      duration,
      expired,
      expiration,
      refreshed,
      available,
    }
  }

export const ticketStatus = (
  his: TicketHistory,
  uses: Ticket['uses'],
): TicketStatus[] => {
  const getStatus = factory(his)

  return uses.map((use) => {
    const self = getStatus(use)
    const dependency = whenDefined(use.dependsOn, (dep) =>
      whenDefined(
        uses.find((u) => u.id === dep),
        getStatus,
      ),
    )
    const available = self.available

    const enablable = dependency
      ? dependency
        ? dependency.expired === false && self.unused
        : false // Dependency is not used yet, so this benefit is not enablable yet.
      : !self.available

    return {
      available,
      enablable,
      self,
      dependency,
    }
  })
}
