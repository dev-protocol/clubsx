import { createClient } from 'redis'

/**
 * This accepts only 3-42 strings includes a-z, 0-9 or -, and returns boolean
 * @param site the string of site name
 * @returns boolean
 */
const validate = (site?: string): site is string =>
  site ? /^[a-z|0-9|-]{3,42}$/.test(site) : false

export const get = async ({
  params: { site },
}: {
  params: { site?: string }
}) => {
  const validNaming = validate(site)

  const client = validNaming
    ? createClient({
        url: process.env.REDIS_URL,
        username: process.env.REDIS_USERNAME ?? '',
        password: process.env.REDIS_PASSWORD ?? '',
      })
    : undefined
  await client?.connect()

  client?.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const count = await client?.exists(site as string)
  const validNamespace = typeof count === 'number' ? count === 0 : undefined

  try {
    await client?.quit()
    const body = !validNaming
      ? { error: 'Invalid naming' }
      : !validNamespace
      ? { error: 'Aleady exists' }
      : {}
    const status = validNaming && validNamespace ? 200 : 400
    return new Response(JSON.stringify(body), { status })
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
}
