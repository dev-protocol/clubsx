import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

dayjs.extend(duration)
dayjs.extend(utc)

const AVAILABLE_UNITS = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'months',
  'years',
]

export const formatDuration = (str: string) => {
  const [t, unit] = str.split(' ')
  const time = Number(t)

  return time && AVAILABLE_UNITS.includes(unit)
    ? dayjs.duration({ [unit]: time })
    : undefined
}

export const period = (start: Date, duration: duration.Duration) => {
  return dayjs
    .utc(start.toString())
    .add(duration.asMilliseconds(), 'milliseconds')
}

export const isExpired = (start: Date, duration: duration.Duration) => {
  return period(start, duration).isBefore(dayjs.utc())
}
