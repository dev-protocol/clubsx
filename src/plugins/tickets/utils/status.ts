import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import {
  expirationDatetime,
  formatDuration,
  isExpiredNow,
  isInUnavalableNow,
  period,
  time,
} from './date'
import type { Dayjs } from 'dayjs'

export type StatusUnit = {
  use: Ticket['uses'][0]
  history?: TicketHistory
  unused: boolean
  expired?: boolean
  expiration?: Dayjs
  refreshed?: boolean
  availableBetween?: {
    start?: Dayjs
    end?: Dayjs
  }
  inUnavailable?: boolean
}

export type TicketStatus = {
  available: boolean
  inUnavailableTime: boolean
  enablable: boolean
  self: StatusUnit
  dependency?: StatusUnit
  availableBetween?: {
    start?: Dayjs
    end?: Dayjs
  }
}

export const factory =
  (_history: TicketHistories) =>
  (use: Ticket['uses'][0]): StatusUnit => {
    const history = use.id in _history ? _history[use.id] : undefined
    const refreshingExpiration = whenDefinedAll(
      [
        history,
        use.refreshCycle ? formatDuration(use.refreshCycle) : undefined,
      ],
      ([h, ex]) => period(h.datetime, ex),
    )
    const expiration =
      whenDefinedAll([history, use.expiration], ([h, ex]) =>
        expirationDatetime(h.datetime, ex.end, ex.duration, ex.tz),
      ) ?? refreshingExpiration
    const refreshed = whenDefined(refreshingExpiration, isExpiredNow)
    const unused = refreshed ?? history === undefined
    const expired = whenDefined(expiration, isExpiredNow)
    const availableBetween = whenDefined(use.expiration, (exp) => ({
      start: time(exp.start, exp.tz),
      end: time(exp.end, exp.tz),
    }))
    const inUnavailable = expired
      ? false
      : whenDefinedAll(
          [use.expiration?.start, use.expiration?.end, use.expiration?.tz],
          ([startTime, endTime, tz]) =>
            isInUnavalableNow(startTime, endTime, tz),
        )
    return {
      use,
      history,
      unused,
      expired,
      expiration,
      refreshed,
      availableBetween,
      inUnavailable,
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
      whenDefined(
        dependency,
        ({ expired, expiration, inUnavailable, availableBetween }) =>
          expired === true || (expired === false && inUnavailable === true)
            ? { ..._self, expired, expiration, inUnavailable, availableBetween }
            : _self,
      ) ?? _self // If there is a dependency and its `expired` is true, it inherits the dependency's `expired`.
    const inUnavailableTime = self.inUnavailable === true
    const available = inUnavailableTime
      ? false
      : self.expired === false || self.refreshed === false

    const enablable = dependency
      ? dependency.expired === false && self.unused
      : self.expired === undefined
    const availableBetween = self.availableBetween

    return {
      available,
      enablable,
      inUnavailableTime,
      self,
      dependency,
      availableBetween,
    }
  })
}
