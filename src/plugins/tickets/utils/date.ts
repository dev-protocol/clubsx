import dayjs, { type UnitTypeLong } from 'dayjs'
import duration, { type DurationUnitType } from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import calendar from 'dayjs/plugin/calendar'
import { whenDefined } from '@devprotocol/util-ts'

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(calendar)

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

export const formatDuration = (str: string) => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return time && isAvailableUnitsDuration(unit)
    ? dayjs.duration(time, unit)
    : undefined
}

export const period = (start: Date, duration: duration.Duration) => {
  return dayjs
    .utc(start.toUTCString())
    .add(duration.asMilliseconds(), 'milliseconds')
}

const setTime = (date: dayjs.Dayjs, unit: UnitTypeLong, time: number) =>
  date
    .set(unit, time)
    .set(unit === 'hour' ? 'minute' : 'millisecond', 0)
    .set(unit === 'minute' || unit === 'hour' ? 'second' : 'millisecond', 0)
    .set('millisecond', 0)

export const expirationDatetime = (
  start: Date,
  end: string,
  durationStr: string,
  tz: string,
) => {
  const duration = formatDuration(durationStr)
  const expUtc = whenDefined(duration, (dur) => period(start, dur))
  const [t, unit] = end.split(' ')
  const time = Number(t)

  return expUtc && time && isAvailableUnitsTime(unit)
    ? setTime(
        expUtc
          .tz(tz)
          .subtract(
            1,
            unit === 'second'
              ? 'minute'
              : unit === 'minute'
              ? 'hour'
              : unit === 'hour'
              ? 'day'
              : (undefined as never),
          ),
        unit,
        time,
      )
    : undefined
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

export const now = () => {
  return dayjs.utc()
}
