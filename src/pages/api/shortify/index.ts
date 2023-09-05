import {
  whenDefinedAll,
  whenNotError,
  whenNotErrorAll,
} from '@devprotocol/util-ts'
import { generateShortifyId } from '@fixtures/api/keys'
import { createClient } from 'redis'
import dayjs from 'dayjs'
import duration, { DurationUnitType } from 'dayjs/plugin/duration'
import type { APIRoute } from 'astro'

dayjs.extend(duration)

const MAX_DURARION = dayjs.duration(1, 'week')

const genId = (length: number) => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

const validUnit = (unit: string): unit is DurationUnitType =>
  [
    'second',
    'seconds',
    'minute',
    'minutes',
    'hour',
    'hours',
    'day',
    'days',
    'month',
    'months',
    'year',
    'years',
  ].includes(unit)

export const post: APIRoute = async ({ request, url: { origin } }) => {
  const props = await request
    .json()
    .then(
      (res) =>
        whenDefinedAll(
          [res.url as string, res.exp as string],
          ([url, exp]) => ({
            url,
            exp,
          }),
        ) ?? new Error('Missing {url, exp}'),
    )
    .catch((err) => new Error(err))

  const duration = whenNotError(props, ({ exp }) => {
    const split = exp.split(' ')
    const dur =
      whenDefinedAll([split[0], split[1]], ([number, unit]) =>
        Number(number) && validUnit(unit)
          ? dayjs.duration(Number(number), unit)
          : new Error('Unexpected format'),
      ) ?? new Error('"exp" is passed as an unexpected format')
    return whenNotError(dur, (_dur) =>
      _dur.asMilliseconds() <= MAX_DURARION.asMilliseconds()
        ? _dur
        : new Error('"exp" should be less than 1 week'),
    )
  })

  const expiration = whenNotError(duration, (dur) =>
    dayjs().add(dur).toDate().toISOString(),
  )

  const client = await whenNotError(
    createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
      socket: {
        keepAlive: 1,
        reconnectStrategy: 1,
      },
    }),
    (db) =>
      db
        .connect()
        .then(() => db)
        .catch((err) => new Error(err)),
  )

  const urlId = await whenNotError(client, (db) => {
    return (async () => {
      return new Promise<string>(async (resolve) => {
        let id: string = ''
        let exists = false

        while (!exists) {
          id = genId(5)
          const count = await db.exists(generateShortifyId(id))
          exists = count === 0
        }

        return resolve(id)
      })
    })()
  })

  const key = whenNotError(urlId, generateShortifyId)
  const value = whenNotErrorAll([props, expiration], ([{ url }, exp]) =>
    JSON.stringify({ url, exp }),
  )

  const saved = await whenNotErrorAll([key, value, client], ([k, v, db]) =>
    db.set(k, v).catch((err) => new Error(err)),
  )

  const result = whenNotErrorAll(
    [saved, urlId],
    ([, _urlId]) =>
      new Response(
        JSON.stringify({
          message: true,
          id: _urlId,
          url: new URL(`/s/${_urlId}`, origin),
        }),
        { status: 200 },
      ),
  )

  return result instanceof Error
    ? new Response(
        JSON.stringify({
          error: result.message,
        }),
        { status: 400 },
      )
    : result
}
