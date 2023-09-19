import dayjs, {
  type UnitType,
  type UnitTypeLong,
  type UnitTypeLongPlural,
} from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import calendar from 'dayjs/plugin/calendar'
import { whenDefined } from '@devprotocol/util-ts'

dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(calendar)

const AVAILABLE_UNITS_DURATION = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
]
const AVAILABLE_UNITS_END = ['second', 'minute', 'hour']

const isAvailableUnitsDuration = (unit: string): unit is UnitTypeLongPlural =>
  AVAILABLE_UNITS_DURATION.includes(unit)

const isAvailableUnitsEnd = (unit: string): unit is UnitTypeLong =>
  AVAILABLE_UNITS_END.includes(unit)

const formatDuration = (str: string) => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return time && isAvailableUnitsDuration(unit)
    ? dayjs.duration({ [unit]: time })
    : undefined
}

const period = (start: Date, duration: duration.Duration) => {
  return dayjs
    .utc(start.toUTCString())
    .add(duration.asMilliseconds(), 'milliseconds')
}

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

  return expUtc && time && isAvailableUnitsEnd(unit)
    ? expUtc
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
        )
        .set(unit, time)
        .set(unit === 'hour' ? 'minute' : 'millisecond', 0)
        .set(unit === 'minute' || unit === 'hour' ? 'second' : 'millisecond', 0)
        .set('millisecond', 0)
    : undefined
}

export const isExpiredNow = (exp: dayjs.Dayjs) => {
  return exp.utc().isBefore(now())
}

export const now = () => {
  return dayjs.utc()
}
