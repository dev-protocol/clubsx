import { whenDefined, whenDefinedAll } from '@devprotocol/util-ts'
import type { Ticket, TicketHistories, TicketHistory } from '..'
import {
  create,
  expirationDatetime,
  exploreSlots,
  formatDuration,
  isExpiredNow,
  now,
  period,
  setTime,
  ymd,
} from './date'
import type { Dayjs } from 'dayjs'
import type { ContractRunner } from 'ethers'
import { getMintedAt } from './get-minted-at'

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
  availableUntilIfenabled?: Dayjs
  expirationIfenabled?: Dayjs
  usageStartExpired?: boolean
  usageStartExpiration?: Dayjs
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
  availableUntilIfenabled?: Dayjs
  expirationIfenabled?: Dayjs
  ticket: Ticket
  usageStartExpired?: boolean
  usageStartExpiration?: Dayjs
}

export const factory =
  (_history: TicketHistories, mintedAt?: Dayjs) =>
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
    const within =
      whenDefined(use.within, (_within) => formatDuration(_within)) ?? []
    const usageStartExpiration = whenDefinedAll(
      [mintedAt, within[0]],
      ([_mintedAt, _within]) => period(_mintedAt, _within),
    )
    const usageStartExpired =
      history === undefined && whenDefined(usageStartExpiration, isExpiredNow)
    const firstAvailableTimeStart = whenDefinedAll(
      [use.availability, history],
      ([availability, his]) => {
        const historyBase = create(his.datetime)
        const $1 = exploreSlots({
          availability,
          base: historyBase,
          find: 'start',
          direction: 'future',
        })
        const $2 = exploreSlots({
          availability,
          base: historyBase,
          find: 'start',
          direction: 'past',
        })
        const baseCal = ymd(historyBase)
        /**
         * If this is used on the day of availability,
         * $1 may unjustifiably be a future date, in which case $2 is used.
         */
        const res = baseCal === ymd($1) ? $1 : baseCal === ymd($2) ? $2 : $1
        return res
      },
    )
    const firstAvailableTimeEnd = whenDefinedAll(
      [use.availability, firstAvailableTimeStart],
      ([availability, base]) =>
        exploreSlots({
          availability,
          base,
          find: 'end',
          direction: 'future',
        }),
    )
    const refreshingExpiration = whenDefinedAll(
      [
        firstAvailableTimeStart ?? history,
        use.refreshCycle ? formatDuration(use.refreshCycle)[0] : undefined,
      ],
      ([h, ex]) => period('datetime' in h ? create(h.datetime) : h, ex),
    )
    const expiration = whenDefinedAll(
      [
        firstAvailableTimeStart,
        firstAvailableTimeEnd,
        use.availability,
        use.duration,
      ],
      ([start, min, ava, dur]) => expirationDatetime(start, min, ava, dur),
    )
    const refreshed = whenDefined(refreshingExpiration, isExpiredNow)
    const unused = refreshed ?? history === undefined
    const expired = usageStartExpired
      ? usageStartExpired
      : whenDefined(expiration, isExpiredNow)

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
    const availableUntil = expired ? undefined : slots.find.end.direction.future

    /**
     * will be a Dayjs object when not expired or it has history
     */
    const availableAt =
      expired || !history
        ? undefined
        : slots.find.start.direction.future?.isBefore(availableUntil)
        ? slots.find.start.direction.future
        : slots.find.start.direction.past

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

    /**
     * will be a Dayjs object when availableAtIfenabled exists
     */
    const availableUntilIfenabled = whenDefinedAll(
      [use.availability, availableAtIfenabled],
      ([availability, base]) =>
        exploreSlots({
          availability,
          base: base,
          find: 'end',
          direction: 'future',
        }),
    )

    /**
     * will be a Dayjs object when availableUntilIfenabled/availableUntilIfenabled exists
     */
    const expirationIfenabled = whenDefinedAll(
      [
        availableAtIfenabled,
        availableUntilIfenabled,
        use.availability,
        use.duration,
      ],
      ([start, min, ava, dur]) => expirationDatetime(start, min, ava, dur),
    )

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
      availableUntilIfenabled,
      expirationIfenabled,
      usageStartExpired,
      usageStartExpiration,
    }
  }

export const ticketStatus = async (
  history: TicketHistories,
  ticket: Ticket,
  opts: {
    tokenId: number | string
    provider: ContractRunner
  },
): Promise<TicketStatus[]> => {
  const mintedAt = await getMintedAt(opts)
  const getStatus = factory(history, mintedAt)

  return ticket.uses.map((use) => {
    const _self = getStatus(use)
    console.log({ _self })
    const dependency = whenDefined(use.dependsOn, (dep) =>
      whenDefined(
        ticket.uses.find((u) => u.id === dep),
        getStatus,
      ),
    )
    const self: StatusUnit =
      whenDefined(
        dependency,
        ({
          expired,
          expiration,
          availableAt,
          availableAtIfenabled,
          availableUntil,
          availableUntilIfenabled,
          expirationIfenabled,
          inUse,
        }) => {
          return expired === true
            ? // Dependency has expired
              {
                ..._self,
                expired,
                expiration,
                availableAt,
                availableAtIfenabled,
                availableUntil,
                availableUntilIfenabled,
                expirationIfenabled,
              }
            : expired === false &&
              availableAt !== undefined &&
              _self.inUse === false
            ? // This is not used, so inherits dependency's *Ifenabled values
              {
                ..._self,
                availableAtIfenabled: availableAt,
                availableUntilIfenabled: availableUntil,
                expirationIfenabled: expiration,
              }
            : expired === false &&
              availableAt !== undefined &&
              inUse === false &&
              _self.inUse
            ? // Dependency temporarily unavailable
              {
                ..._self,
                expired,
                inUse,
                availableAt,
                availableUntil,
                expiration,
              }
            : _self
        },
      ) ?? _self // If there is a dependency and its `expired` is true, it inherits the dependency's `expired`.
    const {
      availableAt,
      availableUntil,
      availableAtIfenabled,
      availableUntilIfenabled,
      expirationIfenabled,
      usageStartExpired,
      usageStartExpiration,
    } = self
    const inUse = self.expired ? false : self.inUse
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
      availableUntilIfenabled,
      expirationIfenabled,
      isTempUnavailable,
      usageStartExpired,
      usageStartExpiration,
    }
  })
}
