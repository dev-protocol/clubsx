import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import {
  expirationDatetime,
  exploreSlots,
  formatDuration,
  isExpiredNow,
  isInUnavalableNow,
  now,
  period,
  setTime,
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
  inUse: boolean
  availableAt?: Dayjs
  availableAtIfenabled?: Dayjs
  availableUntil?: Dayjs
}

export type TicketStatus = {
  available: boolean
  isTempUnavailable: boolean
  enablable: boolean
  self: StatusUnit
  dependency?: StatusUnit
  inUse: boolean
  availableAt?: Dayjs
  availableAtIfenabled?: Dayjs
  availableUntil?: Dayjs
  ticket: Ticket
}

export const factory =
  (_history: TicketHistories) =>
  (use: Ticket['uses'][0]): StatusUnit => {
    const base = now()
    const base0 = setTime(base, 'hour', 0)
    const base24 = setTime(base, 'hour', 24)
    const slots = {
      find: {
        start: {
          direction: {
            past: whenDefined(use.availability, (availability) =>
              exploreSlots({
                availability,
                base,
                find: 'start',
                direction: 'past',
              }),
            ),
            future: whenDefined(use.availability, (availability) =>
              exploreSlots({
                availability,
                base,
                find: 'start',
                direction: 'future',
              }),
            ),
          },
        },
        end: {
          direction: {
            past: whenDefined(use.availability, (availability) =>
              exploreSlots({
                availability,
                base,
                find: 'end',
                direction: 'past',
              }),
            ),
            future: whenDefined(use.availability, (availability) =>
              exploreSlots({
                availability,
                base,
                find: 'end',
                direction: 'future',
              }),
            ),
          },
        },
      },
    }
    const history = use.id in _history ? _history[use.id] : undefined
    const refreshingExpiration = whenDefinedAll(
      [
        history,
        use.refreshCycle ? formatDuration(use.refreshCycle) : undefined,
      ],
      ([h, ex]) => period(h.datetime, ex),
    )
    const expiration = whenDefinedAll(
      [history, use.availability, use.duration],
      ([h, ava, dur]) => expirationDatetime(h.datetime, ava, dur),
    )
    const refreshed = whenDefined(refreshingExpiration, isExpiredNow)
    const unused = refreshed ?? history === undefined
    const expired = whenDefined(expiration, isExpiredNow)

    /**
     * will be true when history exists & current time is in between an available slot
     */
    const inUse = expired
      ? false
      : history
      ? whenDefinedAll(
          [slots.find.start.direction.past, slots.find.end.direction.future],
          ([start, end]) =>
            base.isBetween(start, end) &&
            start.isBetween(base0, base24) &&
            end.isBetween(base0, base24),
        ) ?? refreshed === false
      : false

    /**
     * will be a Dayjs object when not expired & now inUse
     */
    const availableUntil =
      expired || !inUse ? undefined : slots.find.end.direction.future

    /**
     * will be a Dayjs object when not expired or it has history
     */
    const availableAt =
      expired || !history ? undefined : slots.find.start.direction.future

    /**
     * will be a Dayjs object when not expired and it has not history and not inUse
     */
    const availableAtIfenabled = expired
      ? undefined
      : !history && !inUse
      ? whenDefinedAll(
          [
            slots.find.start.direction.past,
            slots.find.end.direction.future,
            slots.find.start.direction.future,
          ],
          ([prevStart, nearEnd, futureSlot]) => {
            console.log({ prevStart, nearEnd, futureSlot })
            return prevStart.isBetween(base0, base24) &&
              nearEnd.isBetween(base0, base24) &&
              prevStart.isBefore(base) &&
              nearEnd.isAfter(base)
              ? prevStart
              : futureSlot
          },
        )
      : undefined

    return {
      use,
      history,
      unused,
      expired,
      expiration,
      refreshed,
      inUse,
      availableAt,
      availableAtIfenabled,
      availableUntil,
    }
  }

export const ticketStatus = (
  history: TicketHistories,
  ticket: Ticket,
): TicketStatus[] => {
  const getStatus = factory(history)

  return ticket.uses.map((use) => {
    const _self = getStatus(use)
    console.log({ _self })
    const dependency = whenDefined(use.dependsOn, (dep) =>
      whenDefined(
        ticket.uses.find((u) => u.id === dep),
        getStatus,
      ),
    )
    console.log({ dependency })
    const self =
      whenDefined(
        dependency,
        ({ expired, expiration, availableAt, availableAtIfenabled, inUse }) =>
          expired === true || (expired === false && availableAt !== undefined)
            ? {
                ..._self,
                expired,
                expiration,
                availableAt,
                availableAtIfenabled,
                inUse,
              }
            : _self,
      ) ?? _self // If there is a dependency and its `expired` is true, it inherits the dependency's `expired`.
    const { inUse, availableAt, availableUntil, availableAtIfenabled } = self
    const isTempUnavailable =
      self.expired === false && !inUse && availableAt !== undefined
    const available = dependency ? dependency.inUse && inUse : inUse
    const enablable = inUse ? false : Boolean(availableAtIfenabled)

    return {
      available,
      enablable,
      self,
      dependency,
      ticket,
      inUse,
      availableAt,
      availableAtIfenabled,
      availableUntil,
      isTempUnavailable,
    }
  })
}
