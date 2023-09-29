import dayjs, { type UnitTypeLong, type UnitTypeLongPlural } from 'dayjs'
import duration, {
  type Duration,
  type DurationUnitType,
} from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import calendar from 'dayjs/plugin/calendar'
import weekday from 'dayjs/plugin/weekday'
import isBetween from 'dayjs/plugin/isBetween'
import {
  whenDefined,
  whenDefinedAll,
  type UndefinedOr,
} from '@devprotocol/util-ts'
import { SlotType, type Slot } from '..'

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(calendar)
dayjs.extend(weekday)
dayjs.extend(isBetween)

const AVAILABLE_UNITS_DURATION: DurationUnitType[] = [
  'second',
  'seconds', // Same as second
  'minute',
  'minutes', // Same as minute
  'hour',
  'hours', // Same as hours
  'day',
  'days', // Same as days
  'week',
  'weeks', // Same as week
  'month',
  'months', // Same as month
  'year',
  'years', // Same as year
]
const AVAILABLE_UNITS_TIME: UnitTypeLong[] = ['second', 'minute', 'hour']

const isAvailableUnitsDuration = (unit: string): unit is DurationUnitType =>
  AVAILABLE_UNITS_DURATION.includes(unit as DurationUnitType)

const isAvailableUnitsTime = (unit: string): unit is UnitTypeLong =>
  AVAILABLE_UNITS_TIME.includes(unit as UnitTypeLong)

export const formatDuration = (
  str: string,
): [UndefinedOr<Duration>, UndefinedOr<DurationUnitType>] => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return time && isAvailableUnitsDuration(unit)
    ? [dayjs.duration(time, unit), unit]
    : [undefined, undefined]
}

export const period = (start: dayjs.Dayjs, duration: duration.Duration) => {
  return start.add(duration)
}

export const setTime = (date: dayjs.Dayjs, unit: UnitTypeLong, time: number) =>
  date
    .clone()
    .set(unit, time)
    .set(unit === 'hour' ? 'minute' : 'millisecond', 0)
    .set(unit === 'minute' || unit === 'hour' ? 'second' : 'millisecond', 0)
    .set('millisecond', 0)

export const oneUnitUpToDay = (dur: Duration): Duration => {
  return dayjs.duration(
    1,
    dur.asDays() >= 1
      ? 'day'
      : dur.asHours() >= 1
      ? 'hour'
      : dur.asMinutes() >= 1
      ? 'minute'
      : dur.asSeconds() >= 1
      ? 'second'
      : 'millisecond',
  )
}
export const expirationDatetime = (
  start: dayjs.Dayjs,
  min: dayjs.Dayjs,
  availability: Slot[],
  durationStr: string,
) => {
  const [duration] = formatDuration(durationStr)
  const one = whenDefined(duration, (dur) => oneUnitUpToDay(dur))
  const exp = whenDefinedAll([duration, one], ([dur, one]) =>
    period(start.subtract(one), dur),
  )
  const slot = whenDefined(exp, (base) =>
    exploreSlots({
      availability,
      base,
      find: 'end',
      direction: 'future',
      acceptOppositeDirection: true,
    }),
  )
  console.log({ exp, slot })

  return slot ? (slot.isSame(min) || slot.isAfter(min) ? slot : min) : undefined
}

export const slotToDayjs = (slot: Slot, use: 'start' | 'end') =>
  slot.type === SlotType.WeekdayTime
    ? time(use === 'start' ? slot.start : slot.end, slot.tz)?.utc()
    : (undefined as never)

export const exploreSlots = ({
  availability,
  base,
  find,
  direction,
  acceptOppositeDirection: opp,
}: {
  availability: Slot[]
  base: dayjs.Dayjs
  find: 'start' | 'end'
  direction: 'past' | 'future'
  acceptOppositeDirection?: boolean
}): UndefinedOr<dayjs.Dayjs> => {
  let diff: number = 0
  const baseTimestamp = base.clone().utc().toDate().getTime()
  const extendeddata: (Slot & { dayjs?: dayjs.Dayjs })[] = [...availability]
  const MAX = base.clone().add(100, 'years')
  const MIN = base.clone().subtract(100, 'years')
  const expectedDateOrBigDiff = (d: dayjs.Dayjs, tz?: string): dayjs.Dayjs => {
    const _base = base.clone().tz(tz)
    return find === 'start'
      ? direction === 'future'
        ? d.isAfter(_base) || d.isSame(_base)
          ? d
          : MAX // When it's expecting a starting time in the future but the date is in the past than the present
        : d
      : direction === 'past'
      ? d.isBefore(_base) || d.isSame(_base)
        ? d
        : MIN // When it's expecting a ending time in the past but the date is in the future than the present
      : d
  }

  const hit = extendeddata.reduce((_prev, _current) => {
    const prevD = findNearDayBySlot(_prev, base, find, direction, opp)
    const currentD = findNearDayBySlot(_current, base, find, direction, opp)

    const prev = whenDefined(prevD, (p) => expectedDateOrBigDiff(p, _prev.tz))
    const current = whenDefined(currentD, (c) =>
      expectedDateOrBigDiff(c, _current.tz),
    )

    const res = whenDefinedAll([prev, current], ([p, c]) => {
      const diffPrev = Math.abs(baseTimestamp - p.utc().toDate().getTime())
      const diffCurrent = Math.abs(baseTimestamp - c.utc().toDate().getTime())
      const [_diff, slot] =
        diffPrev < diffCurrent
          ? [diffPrev, { ..._prev, dayjs: p }]
          : [diffCurrent, { ..._current, dayjs: c }]
      const nextDiff = diff < _diff ? diff : _diff
      diff = nextDiff
      return slot
    })

    return res ?? _prev
  })
  return hit.dayjs
}

export const isExpiredNow = (exp: dayjs.Dayjs) => {
  return exp.utc().isBefore(now())
}

export const isInUnavalableNow = (start: string, end: string, tz: string) => {
  const current = now().tz(tz)
  const testStart = time(start, tz)
  const testEnd = time(end, tz)
  console.log({ current, testStart, testEnd })
  return testStart && testEnd
    ? current.isBefore(testStart) || current.isAfter(testEnd)
    : undefined
}

export const time = (str: string, tz: string) => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return str && isAvailableUnitsTime(unit)
    ? setTime(now().tz(tz), unit, time)
    : undefined
}

export const formatTime = (
  str: string,
): UndefinedOr<[unit: UnitTypeLong, time: number]> => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return str && isAvailableUnitsTime(unit) ? [unit, time] : undefined
}

export const findNearDayBySlot = (
  slot: Slot,
  base: dayjs.Dayjs,
  use: 'start' | 'end',
  direction: 'past' | 'future',
  opp: boolean = false,
) =>
  slot.type === SlotType.WeekdayTime
    ? whenDefined(
        whenDefined(
          formatTime(use === 'start' ? slot.start : slot.end),
          ([unit, time]) => {
            return setTime(base.clone().tz(slot.tz), unit, time)
          },
        ),
        (basetime) => {
          return findNearDayByWeekday(slot.weekday, basetime, direction, opp)
        },
      )
    : (undefined as never)

export const findNearDayByWeekday = (
  weekday: number,
  base: dayjs.Dayjs,
  direction: 'past' | 'future',
  acceptOppositeDirection: boolean = false,
) => {
  const current = base.weekday()
  const baseTimestamp = base.unix()
  const arr = new Array(7).fill('')
  const candidates$1 = arr.map((_, i) =>
    base.weekday(direction === 'past' ? current - i : current + i),
  )
  const candidates$2 = arr.map((_, i) =>
    base.weekday(direction === 'past' ? current + i : current - i),
  )
  const candidates = acceptOppositeDirection
    ? [...candidates$1, ...candidates$2]
    : candidates$1
  const list = candidates.filter((cand) => cand.weekday() === weekday)
  const hit = list.reduce((prev, curt) =>
    Math.abs(baseTimestamp - prev.unix()) <
    Math.abs(baseTimestamp - curt.unix())
      ? prev
      : curt,
  )
  return hit
}

export const now = () => {
  return dayjs.utc()
}

export const create = (dt: Date) => {
  return dayjs(dt)
}
